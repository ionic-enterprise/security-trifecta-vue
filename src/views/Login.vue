<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ canUnlock ? 'Unlock' : 'Login' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content">
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
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button
          expand="full"
          data-testid="signin-button"
          :disabled="!(canUnlock || meta.valid)"
          @click="signinClicked"
        >
          {{ canUnlock ? 'Redo Sign In' : 'Sign In' }}
          <ion-icon slot="end" :icon="logInOutline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/vue';
import { logInOutline, lockOpenOutline } from 'ionicons/icons';
import { Device } from '@ionic-enterprise/identity-vault';
import { defineComponent, ref } from 'vue';
import { useForm, useField } from 'vee-validate';
import { useRouter } from 'vue-router';
import { object as yupObject, string as yupString } from 'yup';
import useAuth from '@/use/auth';
import useSessionVault, { UnlockMode } from '@/use/session-vault';

export default defineComponent({
  name: 'Login',
  components: {
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  },
  setup() {
    const { canUnlock: canUnlockSession, setUnlockMode } = useSessionVault();
    const { login } = useAuth();
    const router = useRouter();
    const errorMessage = ref('');
    const displayUnlockOptions = isPlatform('hybrid');
    const canUnlock = ref(false);

    const mainRoute = '/home';

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

    canUnlockSession().then((x: boolean) => {
      canUnlock.value = x && isPlatform('hybrid');
    });

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
          setUnlockMode(unlockMode.value);
          router.replace(mainRoute);
        } else {
          errorMessage.value = 'Invalid email and/or password';
        }
      }
    };

    const unlockClicked = () => {
      router.replace(mainRoute);
    };

    return {
      lockOpenOutline,
      logInOutline,

      email,
      password,
      unlockMode,

      errors,
      meta,
      errorMessage,

      canUnlock,
      displayUnlockOptions,
      unlockModes,

      signinClicked,
      unlockClicked,
    };
  },
});
</script>

<style scoped>
.unlock-app {
  margin-top: 3em;
  font-size: xx-large;
}
</style>
