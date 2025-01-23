import {defineStore} from "pinia";
import axios from "axios";

export interface RoomInfo {
    roomId: number;
    title: string;
    uname: string;
    liveStatus: boolean;
    recording: boolean;
    listening: boolean;
}

export const useDataStore = defineStore("data", {
    state: () => ({
        rooms: [] as RoomInfo[]
    }),
    actions: {
        async updateRooms() {
            try {
                const ret = await axios.get("/api/room/roomList");
                const {code, data} = ret.data;
                if (code === 0) {
                    console.log(data);
                    this.rooms.length = 0;
                    data.forEach((room: RoomInfo) => {
                        this.rooms.push(room);
                    });
                } else {
                    console.error("Failed to update rooms");
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
})