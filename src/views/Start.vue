<template>
  <ion-page>
    <ion-content class="main-content"> </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import useSessionVault from '@/use/session-vault';
export default defineComponent({
  name: 'Start',
  components: {
    IonContent,
    IonPage,
  },
  setup() {
    const { canUnlock } = useSessionVault();
    const router = useRouter();

    canUnlock().then((x: boolean) => {
      if (x) {
        router.replace('/login');
      } else {
        router.replace('/home');
      }
    });
  },
});
</script>
