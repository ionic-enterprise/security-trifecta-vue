<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Login</ion-card-title>
      <ion-card-subtitle> Secure Storage Demo Application (Vue) </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-list>
        <ion-item>
          <ion-input
            label="Email"
            label-placement="floating"
            type="email"
            name="email"
            v-model="email"
            data-testid="email-input"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            label="Password"
            label-placement="floating"
            type="password"
            name="password"
            v-model="password"
            data-testid="password-input"
          ></ion-input>
        </ion-item>

        <ion-item v-if="displayUnlockOptions">
          <ion-select label="Session Locking" v-model="unlockMode" data-testid="unlock-opt-select">
            <ion-select-option v-for="unlockMode of unlockModes" :value="unlockMode.mode" :key="unlockMode.mode">{{
              unlockMode.label
            }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <div class="error-message ion-padding" data-testid="message-area">
        <div v-for="(error, idx) of errors" :key="idx">
          {{ error }}
        </div>
        <div v-if="errorMessage">{{ errorMessage }}</div>
      </div>

      <div>
        <ion-button expand="full" data-testid="signin-button" :disabled="!meta.valid" @click="signinClicked">
          Sign In
          <ion-icon slot="end" :icon="logInOutline"></ion-icon>
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/auth';
import { useSessionVault, UnlockMode } from '@/composables/session-vault';
import { Device } from '@ionic-enterprise/identity-vault';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue';
import { logInOutline } from 'ionicons/icons';
import { useField, useForm } from 'vee-validate';
import { object as yupObject, string as yupString } from 'yup';
import { ref } from 'vue';

const { canUnlock: canUnlockSession, canUseLocking, setUnlockMode } = useSessionVault();
const { login } = useAuth();
const errorMessage = ref('');
const displayUnlockOptions = canUseLocking();
const canUnlock = ref(false);

const emit = defineEmits(['success']);

const unlockMode = ref<UnlockMode>('SessionPIN');
const unlockModes = ref<Array<{ mode: UnlockMode; label: string }>>([
  {
    mode: 'SessionPIN',
    label: 'Session PIN Unlock',
  },
  {
    mode: 'NeverLock',
    label: 'Never Lock Session',
  },
  {
    mode: 'ForceLogin',
    label: 'Force Login',
  },
]);

Device.isBiometricsEnabled().then((enabled: boolean) => {
  if (enabled) {
    unlockMode.value = 'Device';
    unlockModes.value = [
      {
        mode: 'Device',
        label: 'Biometric Unlock',
      },
      ...unlockModes.value,
    ];
  }
});

canUnlockSession().then((x: boolean) => (canUnlock.value = x));

const validationSchema = yupObject({
  email: yupString().required().email().label('Email Address'),
  password: yupString().required().label('Password'),
});

const { errors, meta } = useForm({ validationSchema });
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const signinClicked = async () => {
  if (await login(email.value as string, password.value as string)) {
    await setUnlockMode(unlockMode.value);
    emit('success');
  } else {
    errorMessage.value = 'Invalid email and/or password';
  }
};
</script>
