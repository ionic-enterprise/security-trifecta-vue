<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Session is Locked</ion-card-title>
      <ion-card-subtitle> Secure Storage Demo Application (Vue) </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <div>
        <ion-button expand="full" fill="solid" size="default" @click="unlockClicked" data-testid="unlock-button">
          <ion-icon :icon="lockOpenOutline" slot="end"></ion-icon>
          <div>Unlock</div>
        </ion-button>
      </div>

      <div v-if="errorMessage" class="error-message ion-padding" data-testid="message-area">
        {{ errorMessage }}
      </div>

      <div class="ion-padding-top">
        <ion-button
          expand="full"
          fill="clear"
          color="secondary"
          size="small"
          data-testid="signin-button"
          @click="redoClicked"
        >
          Redo Sign In
          <ion-icon slot="end" :icon="logInOutline"></ion-icon>
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { useSessionVault } from '@/composables/session-vault';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon } from '@ionic/vue';
import { lockOpenOutline, logInOutline } from 'ionicons/icons';
import { ref } from 'vue';

const errorMessage = ref('');

const emit = defineEmits(['unlocked', 'vault-cleared']);

const { clearSession, getSession } = useSessionVault();

const redoClicked = async () => {
  await clearSession();
  emit('vault-cleared');
};

const unlockClicked = async () => {
  try {
    await getSession();
    emit('unlocked');
  } catch (err) {
    errorMessage.value = 'Unlock failed';
  }
};
</script>
