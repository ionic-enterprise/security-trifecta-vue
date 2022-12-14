<template>
  <ion-page>
    <ion-header :transparent="true">
      <ion-toolbar>
        <ion-title>Tasting Notes</ion-title>
        <ion-buttons slot="primary">
          <ion-label>Dark</ion-label>
          <ion-toggle v-model="prefersDarkMode"></ion-toggle>
          <ion-button data-testid="sync-button" @click="syncClicked">
            <ion-icon slot="icon-only" :icon="sync"></ion-icon>
          </ion-button>
          <ion-button data-testid="logout-button" @click="logoutClicked">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tasting Notes</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list data-testid="notes-list">
        <ion-item-sliding v-for="note of notes" :key="note.id">
          <ion-item @click="presentNoteEditor($event, note.id)">
            <ion-label>
              <div>{{ note.brand }}</div>
              <div>{{ note.name }}</div>
            </ion-label>
          </ion-item>

          <ion-item-options>
            <ion-item-option color="danger" @click="remove(note)"> Delete </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="presentNoteEditor" data-testid="add-note-button">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';
import useTastingNotes from '@/composables/tasting-notes';
import usePreferences from '@/composables/preferences';
import { logOutOutline, sync } from 'ionicons/icons';
import useAuth from '@/composables/auth';
import useSync from '@/composables/sync';
import { useRouter } from 'vue-router';

const { prefersDarkMode } = usePreferences();
const { notes, refresh, remove } = useTastingNotes();
const { logout } = useAuth();
const router = useRouter();
const syncDatabase = useSync();

const logoutClicked = async (): Promise<void> => {
  await logout();
  router.replace('/login');
};

const presentNoteEditor = async (evt: Event, noteId?: number) => {
  const modal = await modalController.create({
    component: AppTastingNoteEditor,
    componentProps: { noteId },
    backdropDismiss: false,
    swipeToClose: true,
  });
  modal.present();
};

const syncClicked = async () => {
  await syncDatabase();
  await refresh();
};

refresh();
</script>

<style scoped>
ion-toggle.ios {
  margin-left: 1em;
}
</style>
