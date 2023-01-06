<template>
  <ion-page>
    <ion-content class="main-content"> </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useSessionVault } from '@/composables/session-vault';

const { canUnlock } = useSessionVault();
const router = useRouter();

canUnlock().then((x: boolean) => {
  if (x) {
    router.replace('/login');
  } else {
    router.replace('/home');
  }
});
</script>
