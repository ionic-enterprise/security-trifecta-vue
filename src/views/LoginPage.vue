<template>
  <ion-page>
    <ion-content class="main-content">
      <AppUnlockCard
        v-if="canUnlock"
        class="auth-card"
        @unlocked="onUnlocked"
        @vault-cleared="onVaultCleared"
        data-testid="unlock-card"
      />
      <AppLoginCard v-else class="auth-card" @success="onLoginSuccess" data-testid="login-card" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import AppLoginCard from '@/components/AppLoginCard.vue';
import AppUnlockCard from '@/components/AppUnlockCard.vue';
import { useSessionVault } from '@/composables/session-vault';
import { useSync } from '@/composables/sync';
import { IonContent, IonPage } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const { canUnlock: canUnlockSession } = useSessionVault();
const router = useRouter();
const canUnlock = ref(false);

canUnlockSession().then((x: boolean) => (canUnlock.value = x));

const onLoginSuccess = async () => {
  const sync = useSync();
  await sync();
  router.replace('/');
};

const onUnlocked = async () => {
  router.replace('/');
};

const onVaultCleared = () => {
  canUnlock.value = false;
};
</script>

<style scoped>
@media (min-width: 0px) {
  .auth-card {
    margin-top: 25%;
    margin-left: 5%;
    margin-right: 5%;
  }
}
@media (min-width: 576px) {
  .auth-card {
    margin-top: 20%;
    margin-left: 10%;
    margin-right: 10%;
  }
}
@media (min-width: 768px) {
  .auth-card {
    margin-top: 10%;
    margin-left: 20%;
    margin-right: 20%;
  }
}
@media (min-width: 992px) {
  .auth-card {
    margin-top: 10%;
    margin-left: 25%;
    margin-right: 25%;
  }
}
@media (min-width: 1200px) {
  .auth-card {
    margin-top: 10%;
    margin-left: 30%;
    margin-right: 30%;
  }
}
</style>
