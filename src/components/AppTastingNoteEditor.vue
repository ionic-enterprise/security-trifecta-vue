<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons slot="primary">
        <ion-button id="cancel-button" data-testid="cancel-button" @click="cancel">
          <ion-icon slot="icon-only" :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list>
      <ion-item>
        <ion-label position="floating">Brand</ion-label>
        <ion-input name="brand" v-model="brand" data-testid="brand-input"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="floating">Name</ion-label>
        <ion-input name="name" v-model="name" data-testid="name-input"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label>Type</ion-label>
        <ion-select name="teaCategoryId" data-testid="tea-type-select" v-model.number="teaCategoryId">
          <ion-select-option v-for="cat of categories" :value="cat.id" :key="cat.id">{{ cat.name }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>Rating</ion-label>
        <app-rating name="rating" v-model.number="rating" data-testid="rating-input"></app-rating>
      </ion-item>

      <ion-item>
        <ion-label position="floating">Notes</ion-label>
        <ion-textarea name="notes" data-testid="notes-textbox" v-model="notes" rows="5"></ion-textarea>
      </ion-item>
    </ion-list>
    <div class="error-message ion-padding" data-testid="message-area">
      <div v-for="(error, idx) of errors" :key="idx">
        {{ error }}
      </div>
    </div>
  </ion-content>

  <ion-footer>
    <ion-toolbar>
      <ion-button expand="full" data-testid="submit-button" @click="submit" :disabled="!meta.valid">{{
        buttonLabel
      }}</ion-button>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  modalController,
} from '@ionic/vue';
import { close } from 'ionicons/icons';
import { computed } from 'vue';
import { useForm, useField } from 'vee-validate';
import { object as yupObject, string as yupString, number as yupNumber } from 'yup';
import AppRating from './AppRating.vue';
import { useTastingNotes } from '@/composables/tasting-notes';
import { useTeaCategories } from '@/composables/tea-categories';
import { TastingNote } from '@/models';

const props = defineProps({
  noteId: Number,
});

const { categories, refresh: refreshTeaCategories } = useTeaCategories();

const validationSchema = yupObject({
  brand: yupString().required().label('Brand'),
  name: yupString().required().label('Name'),
  notes: yupString().required().label('Notes'),
  teaCategoryId: yupNumber().required().label('Type of Tea'),
  rating: yupNumber().required().label('Rating'),
});

const { errors, meta } = useForm({ validationSchema });
const { value: brand } = useField('brand');
const { value: name } = useField('name');
const { value: notes } = useField('notes');
const { value: teaCategoryId } = useField('teaCategoryId');
const { value: rating } = useField('rating');

const buttonLabel = computed(() => (props.noteId ? 'Update' : 'Add'));
const title = computed(() => `${props.noteId ? '' : 'Add New '}Tasting Note`);

const initialize = async () => {
  if (props.noteId) {
    const { find } = useTastingNotes();
    const note = await find(props.noteId);
    if (note) {
      brand.value = note.brand;
      name.value = note.name;
      notes.value = note.notes;
      teaCategoryId.value = note.teaCategoryId;
      rating.value = note.rating;
    }
  }

  if (categories.value.length === 0) {
    refreshTeaCategories();
  }
};

const cancel = async () => {
  await modalController.dismiss();
};

const submit = async () => {
  const { save } = useTastingNotes();
  const note: TastingNote = {
    brand: brand.value as string,
    name: name.value as string,
    notes: notes.value as string,
    teaCategoryId: teaCategoryId.value as number,
    rating: rating.value as number,
  };
  if (props.noteId) {
    note.id = props.noteId;
  }
  await save(note);
  await modalController.dismiss();
};

initialize();
</script>

<style scoped></style>
