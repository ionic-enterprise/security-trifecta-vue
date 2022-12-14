<template>
  <ion-page>
    <ion-content class="main-content">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ canUnlock ? 'Unlock' : 'Login' }}</ion-card-title>
          <ion-card-subtitle> Secure Storage Demo Application (Vue) </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-list v-if="!canUnlock">
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input type="email" name="email" v-model="email" data-testid="email-input"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="floating">Password</ion-label>
              <ion-input type="password" name="password" v-model="password" data-testid="password-input"></ion-input>
            </ion-item>

            <ion-item v-if="displayUnlockOptions">
              <ion-label>Session Locking</ion-label>
              <ion-select v-model="unlockMode" data-testid="unlock-opt-select">
                <ion-select-option v-for="unlockMode of unlockModes" :value="unlockMode.mode" :key="unlockMode.mode">{{
                  unlockMode.label
                }}</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <div class="unlock-app ion-text-center" v-if="canUnlock" @click="unlockClicked" data-testid="unlock-button">
            <ion-icon :icon="lockOpenOutline"></ion-icon>
            <div>Unlock</div>
          </div>

          <div class="error-message ion-padding" data-testid="message-area">
            <div v-for="(error, idx) of errors" :key="idx">
              {{ error }}
            </div>
            <div v-if="errorMessage">{{ errorMessage }}</div>
          </div>

          <div>
            <ion-button
              expand="full"
              data-testid="signin-button"
              :disabled="!(canUnlock || meta.valid)"
              @click="signinClicked"
            >
              {{ canUnlock ? 'Redo Sign In' : 'Sign In' }}
              <ion-icon slot="end" :icon="logInOutline"></ion-icon>
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import useAuth from '@/composables/auth';
import useSessionVault, { UnlockMode } from '@/composables/session-vault';
import useSync from '@/composables/sync';
import { Device } from '@ionic-enterprise/identity-vault';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue';
import { lockOpenOutline, logInOutline } from 'ionicons/icons';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { object as yupObject, string as yupString } from 'yup';

const { canUnlock: canUnlockSession, canUseLocking, setUnlockMode, getSession } = useSessionVault();
const { login } = useAuth();
const router = useRouter();
const errorMessage = ref('');
const displayUnlockOptions = canUseLocking();
const canUnlock = ref(false);
const sync = useSync();

const mainRoute = '/';

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
const { value: email } = useField('email');
const { value: password } = useField('password');

const signinClicked = async () => {
  if (canUnlock.value) {
    canUnlock.value = false;
  } else {
    if (await login(email.value as string, password.value as string)) {
      await sync();
      setUnlockMode(unlockMode.value);
      router.replace(mainRoute);
    } else {
      errorMessage.value = 'Invalid email and/or password';
    }
  }
};

const unlockClicked = async () => {
  await getSession();
  router.replace(mainRoute);
};
</script>

<style scoped>
.unlock-app {
  margin-top: 3em;
  font-size: xx-large;
}

@media (min-width: 0px) {
  ion-card {
    margin-top: 25%;
    margin-left: 5%;
    margin-right: 5%;
  }
}
@media (min-width: 576px) {
  ion-card {
    margin-top: 20%;
    margin-left: 10%;
    margin-right: 10%;
  }
}
@media (min-width: 768px) {
  ion-card {
    margin-top: 10%;
    margin-left: 20%;
    margin-right: 20%;
  }
}
@media (min-width: 992px) {
  ion-card {
    margin-top: 10%;
    margin-left: 25%;
    margin-right: 25%;
  }
}
@media (min-width: 1200px) {
  ion-card {
    margin-top: 10%;
    margin-left: 30%;
    margin-right: 30%;
  }
}
</style>
