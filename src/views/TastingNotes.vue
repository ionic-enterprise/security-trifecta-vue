<template>
  <ion-page>
    <ion-header :transparent="true">
      <ion-toolbar>
        <ion-title>Tasting Notes</ion-title>
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

<script lang="ts">
import {
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
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { add } from 'ionicons/icons';
import { defineComponent } from 'vue';
//import AppTastingNoteEditor from '@/components/AppTastingNoteEditor.vue';
import useTastingNotes from '@/use/tasting-notes';

export default defineComponent({
  name: 'TastingNotes',
  components: {
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
    IonToolbar,
  },
  setup() {
    const { notes, refresh, remove } = useTastingNotes();

    const presentNoteEditor = async (evt: Event, noteId?: number) => {
      const modal = await modalController.create({
        // component: AppTastingNoteEditor,
        componentProps: { noteId },
        backdropDismiss: false,
        swipeToClose: true,
      });
      modal.present();
    };

    refresh();

    return { add, notes, presentNoteEditor, remove };
  },
});
</script>

<style scoped></style>
