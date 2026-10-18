<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ADDRESS_FORMS, GENDER_NAME_MAX, identityError } from 'src/stores/auth-store'

/* Gender choice used at sign-up and on the profile.
   "Other" asks for a gender name (shown on the profile) and a
   preferred form of address – the word forms the story uses. */

const props = defineProps({
  modelValue: { type: Object, required: true }, // { gender, genderName, address }
  legend: { type: String, default: '' },
  showErrors: { type: Boolean, default: false },
  name: { type: String, default: 'gender' },
})
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const GENDER_OPTIONS = [
  { value: 'm', label: 'auth.genderBoy' },
  { value: 'f', label: 'auth.genderGirl' },
  { value: 'x', label: 'auth.genderOther' },
]

const v = computed(() => props.modelValue)
const error = computed(() => (props.showErrors ? identityError(v.value) : null))

function update(patch) {
  emit('update:modelValue', { ...v.value, ...patch })
}
</script>

<template>
  <fieldset class="gb-gender" :class="{ 'has-error': error === 'auth.errors.genderRequired' }">
    <legend class="gb-gender__legend">{{ legend || t('auth.gender') }}</legend>
    <div class="gb-gender__options">
      <label
        v-for="o in GENDER_OPTIONS"
        :key="o.value"
        class="gb-gender__option"
        :class="{ 'is-checked': v.gender === o.value }"
      >
        <input
          type="radio"
          :name="name"
          :value="o.value"
          :checked="v.gender === o.value"
          @change="update({ gender: o.value })"
        />
        {{ t(o.label) }}
      </label>
    </div>

    <div v-if="v.gender === 'x'" class="gb-gender__other">
      <q-input
        :model-value="v.genderName"
        outlined
        :label="t('auth.genderName')"
        :hint="t('auth.genderNameHint')"
        :maxlength="GENDER_NAME_MAX"
        counter
        :error="error === 'auth.errors.genderNameRequired'"
        :error-message="t('auth.errors.genderNameRequired')"
        @update:model-value="update({ genderName: $event })"
      />

      <fieldset
        class="gb-gender gb-gender--nested"
        :class="{ 'has-error': error === 'auth.errors.addressRequired' }"
      >
        <legend class="gb-gender__legend">{{ t('auth.address') }}</legend>
        <div class="gb-gender__options gb-gender__options--wrap">
          <label
            v-for="f in ADDRESS_FORMS"
            :key="f"
            class="gb-gender__option gb-gender__option--form"
            :class="{ 'is-checked': v.address === f }"
          >
            <input
              type="radio"
              :name="`${name}-address`"
              :value="f"
              :checked="v.address === f"
              @change="update({ address: f })"
            />
            <span class="gb-gender__form">
              <span>{{ t(`auth.addressForms.${f}`) }}</span>
              <span class="gb-gender__example">{{ t(`auth.addressExamples.${f}`) }}</span>
            </span>
          </label>
        </div>
        <p
          class="gb-gender__hint"
          :role="error === 'auth.errors.addressRequired' ? 'alert' : undefined"
        >
          {{
            error === 'auth.errors.addressRequired'
              ? t('auth.errors.addressRequired')
              : t('auth.addressHint')
          }}
        </p>
      </fieldset>
    </div>

    <p v-else class="gb-gender__hint" :role="error ? 'alert' : undefined">
      {{ error ? t(error) : t('auth.genderHint') }}
    </p>
  </fieldset>
</template>
