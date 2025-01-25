<script setup lang="ts">
// import {ref} from "vue";
import {useDataStore} from "../stores/data.ts";
import {onBeforeMount} from "vue";
import axios from "axios";
import { ElNotification, ElMessageBox } from 'element-plus';

const dataStore = useDataStore();

const roomList = dataStore.rooms;

onBeforeMount(() => {
  dataStore.updateRooms();
});

function onRemoveRoomClicked(roomId: number) {
  ElMessageBox.confirm('确定删除该房间吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    onStartRemoveRoom(roomId);
  }).catch(() => {
    // do nothing
  });
}

async function onStartRemoveRoom(roomId: number) {
  try {
    const ret = await axios.post('/api/room/deleteRoom', {roomId: roomId});
    const {code, data} = ret.data;
    if (code === 0) {
      ElNotification({
        title: '删除成功',
        message: '删除成功',
        type: 'success',
      });
      dataStore.updateRooms();
    } else {
      console.error(data);
      ElNotification({
        title: '删除失败',
        message: data,
        type: 'error',
      });
    }
  } catch (e: any) {
    console.error(e);
    ElNotification({
      title: '删除失败',
      message: e.message.toString(),
      type: 'error',
    });
  }
}

function onListenStatusChange(_roomId: number, _listening: boolean) {
  let text;
  if (_listening) {
    text = "是否取消监听？";
  } else {
    text = "是否启动监听？";
  }
  ElMessageBox.confirm(text, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    startListenStatusChange(_roomId, _listening);
  }).catch(() => {
    // do nothing
  });
}

async function startListenStatusChange(_roomId: number, _listening: boolean) {
  try {
    const ret = await axios.post('/api/room/setRoomListenStatus', {roomId: _roomId, listening: !_listening});
    const {code, data} = ret.data;
    if (code === 0) {
      ElNotification({
        title: '操作成功',
        message: '操作成功',
        type: 'success',
      });
      dataStore.updateRooms();
    } else {
      console.error(data);
      ElNotification({
        title: '操作失败',
        message: data,
        type: 'error',
      });
    }
  } catch (e: any) {
    console.error(e);
    ElNotification({
      title: '操作失败',
      message: e.message.toString(),
      type: 'error',
    });
  }
}
</script>

<template>
  <el-card>
    <el-table :data="roomList">
      <el-table-column prop="roomId" label="房间号"></el-table-column>
      <el-table-column prop="title" label="标题" width="200"></el-table-column>
      <el-table-column prop="uname" label="主播"></el-table-column>
      <el-table-column prop="liveStatus" label="直播状态">
        <template #default="{ row }">
          <span v-if="row.listening && row.liveStatus">直播中</span>
          <span v-else-if="row.listening && !row.liveStatus">未直播</span>
          <span v-else-if="!row.listening">未监听</span>
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
</template>

<style scoped>

</style>