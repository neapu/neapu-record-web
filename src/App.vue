<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { ElNotification } from 'element-plus';
import { useDataStore } from "./stores/data.ts";

const dataStore = useDataStore();

enum AddRoomFormType {
  RoomId,
  RoomUrl,
}

const showConfigureDialog = ref(false);

const showAddRoomDialog = ref(false);
const addRoomForm = ref({
  roomId: "",
  roomUrl: "",
});
const addRoomFormType = ref(AddRoomFormType.RoomId);
const saveDir = ref("");

function onAddRoomClicked() {
  showAddRoomDialog.value = true;
}

function onAddRoomConfirmClicked() {
  let roomId = addRoomForm.value.roomId;
  if (addRoomFormType.value == AddRoomFormType.RoomUrl) {
    // 从url中提取roomId
    const temp = addRoomForm.value.roomUrl.match(/(\d+)/);
    if (temp) {
      roomId = temp[0];
    }
  }
  if (!roomId) {
    console.log('房间号不能为空');
    return;
  }
  axios.post('/api/room/addRoom', {roomId}).then(rsp=>{
    if (rsp.data.code === 0) {
      console.log('添加成功');
      dataStore.updateRooms();
      showAddRoomDialog.value = false;
    } else {
      ElNotification({
        title: '添加失败',
        message: rsp.data.data,
        type: 'error',
      });
    }
  }).catch(err=>{
    console.error(err);
    ElNotification({
      title: '添加失败',
      message: err.message.toString(),
      type: 'error',
    });
  });
}

function onModifyConfigClicked() {
  // TODO
}

</script>

<template>
  <div class="main">
    <el-card class="opt-card">
      <el-button @click="onAddRoomClicked">添加直播间</el-button>
      <el-button @click="showConfigureDialog = true">设置</el-button>
    </el-card>
    <div class="list-card">
      <RouterView />
    </div>
  </div>
  <el-dialog v-model="showAddRoomDialog">
    <el-form :model="addRoomForm" label-width="100">
      <el-form-item label="类型">
        <el-radio-group v-model="addRoomFormType">
          <el-radio-button :value="0">房间号</el-radio-button>
          <el-radio-button :value="1">房间地址</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="房间号" v-if="addRoomFormType === AddRoomFormType.RoomId">
        <el-input v-model="addRoomForm.roomId"></el-input>
      </el-form-item>
      <el-form-item label="房间地址" v-if="addRoomFormType === AddRoomFormType.RoomUrl">
        <el-input v-model="addRoomForm.roomUrl"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="onAddRoomConfirmClicked">确定</el-button>
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
        <el-button @click="onModifyConfigClicked">确定</el-button>
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
