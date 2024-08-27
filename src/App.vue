<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import axios from 'axios';
import { ElMessageBox, ElNotification } from 'element-plus';

// import ClipboardJS from 'clipboard';

enum LiveStatus {
  NO_LISTEN = -1,
  NOT_LIVE = 0,
  LIVE = 1,
}

interface RoomListItem {
  roomId: string,
  title: string,
  uname: string,
  liveStatus: LiveStatus,
  recording: boolean,
  listening?: boolean,
}

const roomList = ref<RoomListItem[]>([]);
const showAddRoomDialog = ref(false);
const addRoomForm = ref({
  roomId: '',
  roomUrl: '',
});
const formType = ref(0);
const saveDir = ref('');
const showConfigureDialog = ref(false);
let eventSource : EventSource | null = null;

function updateRoomList() {
  axios.get('/api/room/getRooms').then((res) => {
    console.log(res.data);
    roomList.value.length = 0;
    for (const room of res.data) {
      roomList.value.push({
        roomId: room.roomId,
        title: room.title,
        uname: room.uname,
        liveStatus: room.listening ? room.liveStatus ? LiveStatus.LIVE : LiveStatus.NOT_LIVE : LiveStatus.NO_LISTEN,
        recording: room.recording,
        listening: room.listening,
      });
    }
  });
}

function updateSaveDir() {
  axios.get('/api/config/saveDir').then((res) => {
    console.log(res.data);
    saveDir.value = res.data;
  });
}

function startEvents() {
  if (eventSource) {
    return;
  }
  eventSource = new EventSource('/api/events/events');
  eventSource.onmessage = (event) => {
    console.log(event.data);
    const {type, data} = JSON.parse(event.data);
    if (type === 'error') {
      console.error(data.message);
      ElNotification({
        title: '错误',
        message: data.message,
        type: 'error',
        duration: 0,
      });
    } else if (type == 'room_status_change') {
      for (const room of roomList.value) {
        if (room.roomId === data.roomId) {
          room.liveStatus = data.liveStatus;
          room.recording = data.recording;
          break;
        }
      }
    }
  };
}

function addRoom() {
  if (addRoomForm.value.roomId === '' && addRoomForm.value.roomUrl === '') {
    return;
  }
  let roomId = addRoomForm.value.roomId;
  if (roomId === '') {
    // 从url中提取roomId
    const temp = addRoomForm.value.roomUrl.match(/(\d+)/);
    if (temp) {
      roomId = temp[0];
    }
  }
  if (roomId === '') {
    console.log('roomId is empty');
    return;
  }
  axios.post('/api/room/addRoom', { roomId }).then((res) => {
    console.log(res.data);
    showAddRoomDialog.value = false;
    updateRoomList();
  }).catch((err) => {
    console.log(err);
  });
}

function modifyConfig() {
  axios.post('/api/config/setSaveDir', { saveDir: saveDir.value }).then((res) => {
    console.log(res.data);
    updateSaveDir();
    showConfigureDialog.value = false;
  }).catch((err) => {
    console.log(err);
  });
} 

function onAddRoomClicked() {
  addRoomForm.value.roomId = '';
  addRoomForm.value.roomUrl = '';
  showAddRoomDialog.value = true;
}

function onRemoveRoomClicked(roomId: string) {
  ElMessageBox.confirm('确定删除该直播间吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    axios.post('/api/room/removeRoom', { roomId }).then((res) => {
      console.log(res.data);
      updateRoomList();
    }).catch((err) => {
      console.log(err);
    });
  }).catch(() => {
    console.log('cancel');
  });
}

function onListenStatusChange(roomId: string, listening: boolean) {
  axios.post('/api/room/setListenStatus', { roomId, listening: !listening }).then((res) => {
    console.log(res.data);
    updateRoomList();
  }).catch((err) => {
    console.log(err);
  });
}

onBeforeMount(() => {
  console.log('onBeforeMount');
  updateRoomList();
  updateSaveDir();
  startEvents();
});
</script>

<template>
  <div class="main">
    <el-card class="opt-card">
      <el-button @click="onAddRoomClicked">添加直播间</el-button>
      <el-button @click="showConfigureDialog = true">设置</el-button>
    </el-card>
    <el-card class="list-card">
      <el-table :data="roomList">
        <el-table-column prop="roomId" label="房间号"></el-table-column>
        <el-table-column prop="title" label="标题" width="200"></el-table-column>
        <el-table-column prop="uname" label="主播"></el-table-column>
        <el-table-column prop="liveStatus" label="直播状态">
          <template #default="{ row }">
            <span v-if="row.liveStatus === 1">直播中</span>
            <span v-else-if="row.liveStatus === 0">未直播</span>
            <span v-else-if="row.liveStatus === -1">未监听</span>
          </template>
        </el-table-column>
        <el-table-column prop="recording" label="录制状态">
          <template #default="{ row }">
            <span v-if="row.recording">录制中</span>
            <span v-else>未录制</span>
          </template>
        </el-table-column>
        <el-table-column width="180">
          <template #default="{ row }">
            <div style="display: flex;">
              <el-button @click="onListenStatusChange(row.roomId, row.listening)">{{ row.listening ? "取消监听" : "监听" }}</el-button>
              <el-button @click="onRemoveRoomClicked(row.roomId)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  <el-dialog v-model="showAddRoomDialog">
    <el-form :model="addRoomForm" label-width="100">
      <el-form-item label="类型">
        <el-radio-group v-model="formType">
          <el-radio-button :value="0">房间号</el-radio-button>
          <el-radio-button :value="1">房间地址</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="房间号" v-if="formType === 0">
        <el-input v-model="addRoomForm.roomId"></el-input>
      </el-form-item>
      <el-form-item label="房间地址" v-if="formType === 1">
        <el-input v-model="addRoomForm.roomUrl"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="addRoom">确定</el-button>
        <el-button @click="showAddRoomDialog = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <el-dialog v-model="showConfigureDialog">
    <el-form label-width="100">
      <el-form-item label="保存路径">
        <el-input v-model="saveDir"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="modifyConfig">确定</el-button>
        <el-button @click="showConfigureDialog = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.main {
  margin: 0 auto;
  width: 900px;

}

.opt-card {
  margin-top: 20px;
}

.list-card {
  margin-top: 20px;
}
</style>
