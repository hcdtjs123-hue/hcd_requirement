<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8 text-gray-900">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        @click="router.back()"
      >
        ←
      </button>
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-blue-600">Modul Kandidat</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">
          {{ isEdit ? 'Edit Data Kandidat' : 'Form Kandidat Baru' }}
        </h1>
      </div>
    </div>

    <p
      v-if="candidateError || jobRequestError"
      class="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ candidateError || jobRequestError }}
    </p>

    <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <form v-if="!candidateLoading" class="space-y-8" @submit.prevent="handleSubmit">
        <section class="grid gap-4 md:grid-cols-2">
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-gray-700">Job Request</span>
            <select v-model="form.job_request_id" class="field" required>
              <option value="">Pilih job request</option>
              <option v-for="job in jobs" :key="job.id" :value="job.id">
                {{ job.main_position || '-' }} - {{ job.designation || '-' }}
              </option>
            </select>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Tanggal Masuk</span>
            <input v-model="form.date_application" class="field" type="date" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Notice Period</span>
            <input v-model="form.notice_period" class="field" type="date" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">First Name *</span>
            <input v-model="form.first_name" class="field" type="text" required />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Middle Name</span>
            <input v-model="form.middle_name" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Last Name</span>
            <input v-model="form.last_name" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Hire Location</span>
            <input v-model="form.hire_location" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Date of Birth</span>
            <input v-model="form.date_of_birth" class="field" type="date" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Place of Birth</span>
            <input v-model="form.place_of_birth" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Nationality</span>
            <input v-model="form.nationality" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Religion</span>
            <input v-model="form.religion" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Gender</span>
            <select v-model="form.gender" class="field">
              <option value="">Pilih gender</option>
              <option v-for="option in genderOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Marital Status</span>
            <select v-model="form.marital_status" class="field">
              <option value="">Pilih status</option>
              <option v-for="option in maritalStatusOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Ethnic</span>
            <input v-model="form.ethnic" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Blood Type</span>
            <select v-model="form.blood_type" class="field">
              <option value="">Pilih golongan darah</option>
              <option v-for="option in bloodTypeOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </label>
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-gray-700">ID Card Address</span>
            <textarea v-model="form.id_card_address" class="field min-h-24" />
          </label>
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-medium text-gray-700">Residential Address</span>
            <textarea v-model="form.residential_address" class="field min-h-24" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Personal Email</span>
            <input v-model="form.personal_email" class="field" type="email" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Phone Number</span>
            <input v-model="form.phone_number" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">Instagram</span>
            <input v-model="form.instagram" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">LinkedIn</span>
            <input v-model="form.linkedin" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">ID Type</span>
            <input v-model="form.id_type" class="field" type="text" />
          </label>
          <label class="space-y-2">
            <span class="text-sm font-medium text-gray-700">ID No</span>
            <input v-model="form.id_no" class="field" type="text" />
          </label>
        </section>

        <!-- Divider -->
        <div class="h-px bg-gray-100"></div>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Reference</h3>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Reference Name</span
              ><input v-model="form.reference_name" class="field" type="text"
            /></label>
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Reference No</span
              ><input v-model="form.reference_no" class="field" type="text"
            /></label>
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Relationship</span
              ><input v-model="form.reference_relationship" class="field" type="text"
            /></label>
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Position</span
              ><input v-model="form.reference_position" class="field" type="text"
            /></label>
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Transportation</span
              ><input v-model="form.reference_transportation" class="field" type="text"
            /></label>
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Ownership</span
              ><input v-model="form.reference_ownership" class="field" type="text"
            /></label>
            <label class="space-y-2 md:col-span-2"
              ><span class="text-sm font-medium text-gray-700">Residence</span
              ><input v-model="form.reference_residence" class="field" type="text"
            /></label>
          </div>
        </section>

        <!-- Divider -->
        <div class="h-px bg-gray-100"></div>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Family & Emergency</h3>
            <button
              type="button"
              class="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
              @click="addFamilyItem"
            >
              Tambah
            </button>
          </div>
          <div class="space-y-4">
            <div
              v-for="(item, index) in form.family_and_emergency"
              :key="`family-${index}`"
              class="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2"
            >
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Name</span
                ><input v-model="item.name" class="field" type="text"
              /></label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Relationship</span
                ><input v-model="item.relationship" class="field" type="text"
              /></label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Gender</span
                ><select v-model="item.gender" class="field">
                  <option value="">Pilih gender</option>
                  <option v-for="option in genderOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select></label
              >
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Education</span
                ><input v-model="item.education" class="field" type="text"
              /></label>
              <label class="space-y-2 md:col-span-2"
                ><span class="text-sm font-medium text-gray-700">Place and Date of Birth</span
                ><input v-model="item.place_and_date_of_birth" class="field" type="text"
              /></label>
              <label class="space-y-2 md:col-span-2"
                ><span class="text-sm font-medium text-gray-700">Description</span
                ><textarea v-model="item.description" class="field min-h-24" />
              </label>
              <button
                type="button"
                class="justify-self-start rounded-xl text-rose-600 px-3 py-2 text-sm font-medium transition hover:bg-rose-50"
                @click="removeFamilyItem(index)"
              >
                Hapus item
              </button>
            </div>
          </div>
        </section>

        <!-- Divider -->
        <div class="h-px bg-gray-100"></div>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Education</h3>
            <button
              type="button"
              class="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
              @click="addEducationItem"
            >
              Tambah
            </button>
          </div>
          <div class="space-y-4">
            <div
              v-for="(item, index) in form.education"
              :key="`education-${index}`"
              class="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2"
            >
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Level</span
                ><select v-model="item.level" class="field">
                  <option value="">Pilih level</option>
                  <option v-for="option in educationLevelOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select></label
              >
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Institution</span
                ><input v-model="item.institution" class="field" type="text"
              /></label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">City</span
                ><input v-model="item.city" class="field" type="text"
              /></label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Major</span
                ><input v-model="item.major" class="field" type="text"
              /></label>
              <label class="space-y-2">
                <span class="text-sm font-medium text-gray-700">From Year</span>
                <select v-model="item.from_year" class="field">
                  <option :value="null">Pilih tahun</option>
                  <option v-for="year in yearOptions" :key="`education-from-${year}`" :value="year">
                    {{ year }}
                  </option>
                </select>
              </label>
              <label class="space-y-2">
                <span class="text-sm font-medium text-gray-700">To Year</span>
                <select v-model="item.to_year" class="field">
                  <option :value="null">Pilih tahun</option>
                  <option v-for="year in yearOptions" :key="`education-to-${year}`" :value="year">
                    {{ year }}
                  </option>
                </select>
              </label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Category</span
                ><input v-model="item.category" class="field" type="text"
              /></label>
              <label class="space-y-2 md:col-span-2"
                ><span class="text-sm font-medium text-gray-700">Description</span
                ><textarea v-model="item.description" class="field min-h-24" />
              </label>
              <button
                type="button"
                class="justify-self-start rounded-xl text-rose-600 px-3 py-2 text-sm font-medium transition hover:bg-rose-50"
                @click="removeEducationItem(index)"
              >
                Hapus item
              </button>
            </div>
          </div>
        </section>

        <!-- Divider -->
        <div class="h-px bg-gray-100"></div>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Work History</h3>
            <button
              type="button"
              class="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
              @click="addWorkHistoryItem"
            >
              Tambah
            </button>
          </div>
          <div class="space-y-4">
            <div
              v-for="(item, index) in form.work_history"
              :key="`work-${index}`"
              class="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2"
            >
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Company</span
                ><input v-model="item.company" class="field" type="text"
              /></label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Position</span
                ><input v-model="item.position" class="field" type="text"
              /></label>
              <label class="space-y-2">
                <span class="text-sm font-medium text-gray-700">From Year</span>
                <select v-model="item.from_year" class="field">
                  <option :value="null">Pilih tahun</option>
                  <option v-for="year in yearOptions" :key="`work-from-${year}`" :value="year">
                    {{ year }}
                  </option>
                </select>
              </label>
              <label class="space-y-2">
                <span class="text-sm font-medium text-gray-700">To Year</span>
                <select v-model="item.to_year" class="field">
                  <option :value="null">Pilih tahun</option>
                  <option v-for="year in yearOptions" :key="`work-to-${year}`" :value="year">
                    {{ year }}
                  </option>
                </select>
              </label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Last Salary</span
                ><input
                  v-model.number="item.last_salary"
                  class="field"
                  type="number"
                  min="0"
                  @input="sanitizeNestedNumberField(item, 'last_salary')"
              /></label>
              <label class="space-y-2"
                ><span class="text-sm font-medium text-gray-700">Benefit</span
                ><input v-model="item.benefit" class="field" type="text"
              /></label>
              <label class="space-y-2 md:col-span-2"
                ><span class="text-sm font-medium text-gray-700">Reason to Quitting</span
                ><input v-model="item.reason_to_quitting" class="field" type="text"
              /></label>
              <label class="space-y-2 md:col-span-2"
                ><span class="text-sm font-medium text-gray-700">Description</span
                ><textarea v-model="item.description" class="field min-h-24" />
              </label>
              <button
                type="button"
                class="justify-self-start rounded-xl text-rose-600 px-3 py-2 text-sm font-medium transition hover:bg-rose-50"
                @click="removeWorkHistoryItem(index)"
              >
                Hapus item
              </button>
            </div>
          </div>
        </section>

        <!-- Divider -->
        <div class="h-px bg-gray-100"></div>

        <section class="space-y-4">
          <h3 class="text-xl font-semibold">Personal Statement</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <label
              class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
            >
              <input
                v-model="form.personal_statement.contract"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span class="text-sm font-medium text-gray-900">Bersedia kontrak</span>
            </label>
            <label
              class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
            >
              <input
                v-model="form.personal_statement.business_trip"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span class="text-sm font-medium text-gray-900">Bersedia business trip</span>
            </label>
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Contract Period</span
              ><input v-model="form.personal_statement.contract_period" class="field" type="text"
            /></label>
            <label class="space-y-2"
              ><span class="text-sm font-medium text-gray-700">Expected Salary</span
              ><input
                v-model.number="form.personal_statement.expected_salary"
                class="field"
                type="number"
                min="0"
                @input="sanitizeNestedNumberField(form.personal_statement, 'expected_salary')"
            /></label>
            <label class="space-y-2 md:col-span-2"
              ><span class="text-sm font-medium text-gray-700">Legal Issues</span
              ><textarea v-model="form.personal_statement.legal_issues" class="field min-h-24" />
            </label>
            <label class="space-y-2 md:col-span-2"
              ><span class="text-sm font-medium text-gray-700">Reference Check Reason</span
              ><textarea
                v-model="form.personal_statement.reference_check_reason"
                class="field min-h-24"
              />
            </label>
            <label class="space-y-2 md:col-span-2"
              ><span class="text-sm font-medium text-gray-700">Family Details</span
              ><textarea v-model="form.personal_statement.family_details" class="field min-h-24" />
            </label>
            <label class="space-y-2 md:col-span-2"
              ><span class="text-sm font-medium text-gray-700">Detailed Care</span
              ><textarea v-model="form.personal_statement.detailed_care" class="field min-h-24" />
            </label>
            <label class="space-y-2 md:col-span-2"
              ><span class="text-sm font-medium text-gray-700">Serious Accident</span
              ><textarea
                v-model="form.personal_statement.serious_accident"
                class="field min-h-24"
              />
            </label>
            <label class="space-y-2 md:col-span-2"
              ><span class="text-sm font-medium text-gray-700">Psychological Test Details</span
              ><textarea
                v-model="form.personal_statement.psychological_test_details"
                class="field min-h-24"
              />
            </label>
          </div>
        </section>

        <div class="flex gap-3 pt-6 border-t border-gray-100">
          <button
            type="submit"
            class="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            :disabled="candidateSaving"
          >
            {{
              candidateSaving
                ? 'Menyimpan...'
                : isEdit
                  ? 'Update Data Kandidat'
                  : 'Simpan Data Kandidat'
            }}
          </button>
          <button
            type="button"
            class="rounded-2xl border border-gray-200 px-8 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            :disabled="candidateSaving"
            @click="router.back()"
          >
            Batal
          </button>
        </div>
      </form>
      <div v-else class="py-10 text-center text-sm text-gray-500">Memuat data...</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  bloodTypeOptions,
  educationLevelOptions,
  genderOptions,
  maritalStatusOptions,
  type CandidateRecord,
  type CandidateRecordInput,
  type EducationHistoryInput,
  type FamilyEmergencyInput,
  type PersonalStatementInput,
  type WorkHistoryInput,
} from '@/domain/entities/Candidate'
import { useAppToast } from '@/presentation/components/feedback/useAppToast'
import { useCandidateDataViewModel } from '@/viewmodels/useCandidateDataViewModel'
import { useJobRequestViewModel } from '@/viewmodels/useJobRequestViewModel'

const route = useRoute()
const router = useRouter()
const {
  candidates,
  loading: candidateLoading,
  error: candidateError,
  saving: candidateSaving,
  create,
  update,
  refresh: refreshCandidates,
} = useCandidateDataViewModel()

const { jobs, error: jobRequestError, refresh: refreshJobs } = useJobRequestViewModel()
const appToast = useAppToast()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1949 }, (_, index) => currentYear - index)

function createFamilyItem(): FamilyEmergencyInput {
  return {
    name: '',
    relationship: '',
    gender: '',
    place_and_date_of_birth: '',
    education: '',
    description: '',
  }
}

function createEducationItem(): EducationHistoryInput {
  return {
    level: '',
    institution: '',
    city: '',
    major: '',
    from_year: null,
    to_year: null,
    category: '',
    description: '',
  }
}

function createWorkHistoryItem(): WorkHistoryInput {
  return {
    company: '',
    position: '',
    from_year: null,
    to_year: null,
    reason_to_quitting: '',
    last_salary: null,
    benefit: '',
    description: '',
  }
}

function createPersonalStatement(): PersonalStatementInput {
  return {
    contract: false,
    contract_period: '',
    legal_issues: '',
    reference_check_reason: '',
    family_details: '',
    detailed_care: '',
    serious_accident: '',
    psychological_test_details: '',
    business_trip: false,
    expected_salary: null,
  }
}

function createEmptyForm(): CandidateRecordInput {
  return {
    job_request_id: '',
    candidate_id: null,
    date_application: '',
    notice_period: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    hire_location: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    marital_status: '',
    religion: '',
    gender: '',
    ethnic: '',
    blood_type: '',
    id_card_address: '',
    residential_address: '',
    personal_email: '',
    instagram: '',
    linkedin: '',
    phone_number: '',
    id_type: '',
    id_no: '',
    reference_name: '',
    reference_no: '',
    reference_relationship: '',
    reference_position: '',
    reference_transportation: '',
    reference_ownership: '',
    reference_residence: '',
    family_and_emergency: [createFamilyItem()],
    education: [createEducationItem()],
    work_history: [createWorkHistoryItem()],
    personal_statement: createPersonalStatement(),
  }
}

const form = reactive(createEmptyForm())

function mapFamilyItem(
  item: CandidateRecord['family_and_emergency'][number],
): FamilyEmergencyInput {
  return {
    id: item.id,
    name: item.name ?? '',
    relationship: item.relationship ?? '',
    gender: item.gender ?? '',
    place_and_date_of_birth: item.place_and_date_of_birth ?? '',
    education: item.education ?? '',
    description: item.description ?? '',
  }
}

function mapEducationItem(item: CandidateRecord['education'][number]): EducationHistoryInput {
  return {
    id: item.id,
    level: item.level ?? '',
    institution: item.institution ?? '',
    city: item.city ?? '',
    major: item.major ?? '',
    from_year: item.from_year ?? null,
    to_year: item.to_year ?? null,
    category: item.category ?? '',
    description: item.description ?? '',
  }
}

function mapWorkHistoryItem(item: CandidateRecord['work_history'][number]): WorkHistoryInput {
  return {
    id: item.id,
    company: item.company ?? '',
    position: item.position ?? '',
    from_year: item.from_year ?? null,
    to_year: item.to_year ?? null,
    reason_to_quitting: item.reason_to_quitting ?? '',
    last_salary: item.last_salary ?? null,
    benefit: item.benefit ?? '',
    description: item.description ?? '',
  }
}

function mapPersonalStatement(
  personalStatement: CandidateRecord['personal_statement'],
): PersonalStatementInput {
  if (!personalStatement) {
    return createPersonalStatement()
  }

  return {
    contract: Boolean(personalStatement.contract),
    contract_period: personalStatement.contract_period ?? '',
    legal_issues: personalStatement.legal_issues ?? '',
    reference_check_reason: personalStatement.reference_check_reason ?? '',
    family_details: personalStatement.family_details ?? '',
    detailed_care: personalStatement.detailed_care ?? '',
    serious_accident: personalStatement.serious_accident ?? '',
    psychological_test_details: personalStatement.psychological_test_details ?? '',
    business_trip: Boolean(personalStatement.business_trip),
    expected_salary: personalStatement.expected_salary ?? null,
  }
}

function mapListOrDefault<TSource, TOutput>(
  items: TSource[],
  mapper: (item: TSource) => TOutput,
  createFallback: () => TOutput,
) {
  return items.length > 0 ? items.map(mapper) : [createFallback()]
}

function loadData() {
  if (isEdit.value && id.value) {
    const candidate = candidates.value.find((item) => item.id === id.value)
    if (candidate) {
      populateForm(candidate)
    } else if (!candidateLoading.value) {
      appToast.error('Data kandidat tidak ditemukan.')
      router.back()
    }
  }
}

watch(() => candidates.value, loadData, { immediate: true })

onMounted(() => {
  if (jobs.value.length === 0) refreshJobs()
  if (isEdit.value && candidates.value.length === 0) refreshCandidates()
})

function populateForm(candidate: CandidateRecord) {
  Object.assign(form, {
    job_request_id: candidate.job_request_id ?? '',
    candidate_id: candidate.candidate_id ?? null,
    date_application: candidate.date_application ?? '',
    notice_period: candidate.notice_period ?? '',
    first_name: candidate.first_name ?? '',
    middle_name: candidate.middle_name ?? '',
    last_name: candidate.last_name ?? '',
    hire_location: candidate.hire_location ?? '',
    date_of_birth: candidate.date_of_birth ?? '',
    place_of_birth: candidate.place_of_birth ?? '',
    nationality: candidate.nationality ?? '',
    marital_status: candidate.marital_status ?? '',
    religion: candidate.religion ?? '',
    gender: candidate.gender ?? '',
    ethnic: candidate.ethnic ?? '',
    blood_type: candidate.blood_type ?? '',
    id_card_address: candidate.id_card_address ?? '',
    residential_address: candidate.residential_address ?? '',
    personal_email: candidate.personal_email ?? '',
    instagram: candidate.instagram ?? '',
    linkedin: candidate.linkedin ?? '',
    phone_number: candidate.phone_number ?? '',
    id_type: candidate.id_type ?? '',
    id_no: candidate.id_no ?? '',
    reference_name: candidate.reference_name ?? '',
    reference_no: candidate.reference_no ?? '',
    reference_relationship: candidate.reference_relationship ?? '',
    reference_position: candidate.reference_position ?? '',
    reference_transportation: candidate.reference_transportation ?? '',
    reference_ownership: candidate.reference_ownership ?? '',
    reference_residence: candidate.reference_residence ?? '',
    family_and_emergency: mapListOrDefault(
      candidate.family_and_emergency,
      mapFamilyItem,
      createFamilyItem,
    ),
    education: mapListOrDefault(candidate.education, mapEducationItem, createEducationItem),
    work_history: mapListOrDefault(
      candidate.work_history,
      mapWorkHistoryItem,
      createWorkHistoryItem,
    ),
    personal_statement: mapPersonalStatement(candidate.personal_statement),
  })
}

type EditableFormSectionKey = 'family_and_emergency' | 'education' | 'work_history'

function addSectionItem(section: EditableFormSectionKey) {
  switch (section) {
    case 'family_and_emergency':
      form.family_and_emergency.push(createFamilyItem())
      return
    case 'education':
      form.education.push(createEducationItem())
      return
    case 'work_history':
      form.work_history.push(createWorkHistoryItem())
      return
  }
}

function removeSectionItem(section: EditableFormSectionKey, index: number) {
  switch (section) {
    case 'family_and_emergency':
      if (form.family_and_emergency.length === 1) {
        form.family_and_emergency.splice(0, 1, createFamilyItem())
        return
      }
      form.family_and_emergency.splice(index, 1)
      return
    case 'education':
      if (form.education.length === 1) {
        form.education.splice(0, 1, createEducationItem())
        return
      }
      form.education.splice(index, 1)
      return
    case 'work_history':
      if (form.work_history.length === 1) {
        form.work_history.splice(0, 1, createWorkHistoryItem())
        return
      }
      form.work_history.splice(index, 1)
      return
  }
}

function addFamilyItem() {
  addSectionItem('family_and_emergency')
}

function removeFamilyItem(index: number) {
  removeSectionItem('family_and_emergency', index)
}

function addEducationItem() {
  addSectionItem('education')
}

function removeEducationItem(index: number) {
  removeSectionItem('education', index)
}

function addWorkHistoryItem() {
  addSectionItem('work_history')
}

function removeWorkHistoryItem(index: number) {
  removeSectionItem('work_history', index)
}

function sanitizeNestedNumberField(
  target: Record<string, string | number | boolean | null | undefined>,
  key: string,
) {
  const value = target[key]

  if (value === '' || value === null || value === undefined) {
    target[key] = null
    return
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    target[key] = null
    return
  }

  target[key] = Math.max(0, value)
}

function buildPayload(): CandidateRecordInput {
  return {
    ...form,
    gender: form.gender as CandidateRecordInput['gender'],
    marital_status: form.marital_status as CandidateRecordInput['marital_status'],
    blood_type: form.blood_type as CandidateRecordInput['blood_type'],
    education: form.education.map((item) => ({
      ...item,
      level: item.level as EducationHistoryInput['level'],
    })),
    family_and_emergency: form.family_and_emergency.map((item) => ({
      ...item,
      gender: item.gender as FamilyEmergencyInput['gender'],
    })),
  }
}

async function handleSubmit() {
  try {
    if (isEdit.value && id.value) {
      await update(id.value, buildPayload())
      appToast.updated('Kandidat')
    } else {
      await create(buildPayload())
      appToast.created('Kandidat')
    }
    router.push('/candidates')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan data kandidat.'
    appToast.error(message)
  }
}
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(209 213 219);
  background: rgb(249 250 251);
  padding: 0.75rem 1rem;
  color: rgb(17 24 39);
  outline: none;
  transition: all 0.2s;
}
.field:focus {
  border-color: rgb(37 99 235);
  background: white;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}
</style>
