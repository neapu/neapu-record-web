<script setup lang="ts">
// import {ref} from "vue";
import {useDataStore} from "../stores/data.ts";
import {onBeforeMount} from "vue";

const dataStore = useDataStore();

const roomList = dataStore.rooms;

onBeforeMount(() => {
  dataStore.updateRooms();
});

function onRemoveRoomClicked(_roomId: number) {
  // TODO
}

function onListenStatusChange(_roomId: number, _listening: boolean) {
  // TODO
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