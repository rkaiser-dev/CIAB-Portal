/* globals Vue, showSpinner, hideSpinner, confirmbox */
import { useDepartmentStaff } from '../composables/departmentStaff.js';
import { useDepartmentEmail } from '../composables/departmentEmail.js';

const PROPS = {
  data: Object
};

const TEMPLATE = `
  <div class="UI-center">
    <h2 class="UI-red">Position Details</h2>
  </div>
  <div>
    <hr/>
    <label class="UI-label" for="position_name">Position Name:</label>
    <input class="UI-input" id="position_name" v-model="departmentName" />

    <label class="UI-label" for="department_email">Position Emails:</label>
    <div class="UI-border" id="department_email">
      <template v-for="departmentEmail in departmentEmails">
        <button class="UI-roundbutton" @click="editEmailClicked(departmentEmail)">{{ departmentEmail.email }}</button>
        <br/>
      </template>
      <button class="UI-roundbutton" @click="addEmailClicked" :disabled="departmentId === -1"><i class="fas fa-plus-square"></i></button>
    </div>

    <button class="UI-redbutton UI-padding UI-margin" v-if="canEditRbac" :disabled="departmentId === -1" @click="addPermissionsClicked">
      Position Site Permissions (RBAC)
    </button><br/>

    <label class="UI-label" for="department_staff_count">Staff Count:</label>
    <input class="UI-input" id="department_staff_count" readonly :value="staffCount" />

    <div v-if="isDivisionToggle">
      <label class="UI-label" for="department_subdepartments">Sub Departments:</label>
      <input class="UI-input" id="department_subdepartments" readonly :value="subDepartments" />
    </div>

    <div v-if="isDivisionToggle">
      <label class="UI-label" for="department_fallback_dept">Fallback For:</label>
      <select class="UI-select" style="width:auto" id="department_fallback_dept" v-model="selectedFallbackDepartment">
        <option disabled value="">Please select a fallback department</option>
        <option v-for="division in fallbackDivisions" :key="division.id" :value="division">
          {{ division.name }}
        </option>
      </select>
    </div>
    <div v-else>
      <label class="UI-label" for="parent_department">Division:</label>
      <select class="UI-select" style="width:auto" id="parent_department" v-model="selectedParentDepartment">
        <option disabled value="">Please select a parent department</option>
        <option v-for="division in divisions" :key="division.id" :value="division">
          {{ division.name }}
        </option>
      </select>
    </div>
  </div>
  <div>
    <div class="UI-table switch-table UI-padding UI-center">
      <div class="UI-table-row">
        <div class="UI-table-cell">
          <span class="UI-padding">Department</span>
          <label class="switch">
            <input class="toggle" type="checkbox" v-model="isDivisionToggle"/>
            <div class="slider"></div>
          </label>
          <span class="UI-padding">Division</span>
        </div>
      </div>
    </div>
    <div class="UI-center">
      <hr/>
      <button class="UI-eventbutton" @click="onSave">Save</button>
      <button class="UI-yellowbutton" @click="$emit('sidebarClosed')">Close</button>
      <button class="UI-redbutton" @click="onDelete" :disabled="departmentId === -1 || subDepartments > 0 || staffCount > 0">Delete</button>
    </div>
  </div>
`;

function getCurrentData() {
  return {
    id: this.departmentId,
    name: this.departmentName,
    email: this.departmentEmails,
    staffCount: this.staffCount,
    departments: this.subDepartments,
    fallback: this.selectedFallbackDepartment?.id,
    parentId: this.selectedParentDepartment?.id,
    isDivision: this.isDivisionToggle
  }
}

function addEmailClicked() {
  const data = this.getCurrentData();

  this.$emit('addEmailClicked', data);
}

function editEmailClicked(departmentEmail) {
  const data = this.getCurrentData();

  this.$emit('editEmailClicked', data, departmentEmail);
}

function addPermissionsClicked() {
  const data = this.getCurrentData();

  this.$emit('addPermissionsClicked', data);
}

async function onSave() {
  try {
    const confirmBoxTitle = 'Confirms Position Details';
    const confirmBoxMessage = 'Are the position details correct?';

    await confirmbox(confirmBoxTitle, confirmBoxMessage);

    const data = {
      id: this.departmentId,
      departmentName: this.departmentName,
      fallbackDepartment: this.selectedFallbackDepartment,
      parentDepartment: this.selectedParentDepartment,
      isDivision: this.isDivisionToggle
    };

    this.$emit('saveDepartmentClicked', data);
  } catch (error) {
    // User canceled.
  }
}

async function onDelete() {
  try {
    const confirmBoxTitle = 'Confirms Position Deletion';
    const confirmBoxMessage = 'Really delete this position?';

    await confirmbox(confirmBoxTitle, confirmBoxMessage);

    const data = {
      id: this.departmentId
    };

    this.$emit('deleteDepartmentClicked', data);
  } catch (error) {
    // User canceled.
  }
}

function setup(props) {
  const departmentId = Vue.ref(props.data?.id ?? -1);
  const departmentName = Vue.ref(props.data?.name ?? (props.data?.isDivision ? 'New Division' : 'New Department'));
  const departmentEmails = Vue.ref(props.data?.email ?? []);
  const staffCount = Vue.ref(props.data?.staffCount ?? 0);
  const subDepartments = Vue.ref(props.data?.subDepartments ?? 0);
  const isDivisionToggle = Vue.ref(props.data?.isDivision ?? props.isDivision);

  const { departmentStaff, loadingDepartment, departmentError, fetchDepartmentStaff } = useDepartmentStaff();
  const { departmentEmail, loadingDepartmentEmail, departmentEmailError, fetchDepartmentEmail } = useDepartmentEmail();

  const canEditRbac = Vue.inject('canEditRbac');
  const divisions = Vue.inject('divisions');

  const fallbackDepartment = props.data?.fallback ? divisions.value.find((division) => division.id === props.data?.fallback) : {};
  const parentDepartment = props.data?.parentId ? divisions.value.find((division) => division.id === props.data?.parentId) : {};

  const selectedFallbackDepartment = Vue.ref(fallbackDepartment);
  const selectedParentDepartment = Vue.ref(parentDepartment);

  const fallbackReferences = divisions.value.filter((division) => division.fallback != null).map((division) => division.fallback);
  const fallbackDivisions = divisions.value.filter((division) => division.id !== departmentId &&
    (fallbackDepartment?.id === division.id || !fallbackReferences.includes(division.fallback)));

  Vue.watch(departmentStaff, () => {
    staffCount.value = departmentStaff.value?.length ?? 0;
  });

  Vue.watch(departmentEmail, () => {
    departmentEmails.value = departmentEmail.value;
  })

  const loadingValues = [loadingDepartment, loadingDepartmentEmail];

  Vue.watch([loadingDepartment, loadingDepartmentEmail], () => {
    loadingValues.some((item) => item.value) ? showSpinner() : hideSpinner();
  });

  return {
    departmentId,
    departmentName,
    departmentEmails,
    staffCount,
    subDepartments,
    selectedFallbackDepartment,
    selectedParentDepartment,
    isDivisionToggle,
    canEditRbac: canEditRbac.value,
    divisions,
    fallbackDivisions,
    departmentStaff,
    loadingDepartment,
    departmentError,
    fetchDepartmentStaff,
    loadingDepartmentEmail,
    departmentEmailError,
    fetchDepartmentEmail
  }
}

async function onCreated() {
  // Staff count is adjusted by the Vue Watcher
  await this.fetchDepartmentStaff(this.departmentId);
  // Email list is adjusted by the Vue Watcher
  await this.fetchDepartmentEmail(this.departmentId);
}

const StaffSidebarDepartment = {
  props: PROPS,
  emits: ['sidebarClosed', 'addEmailClicked', 'editEmailClicked', 'saveDepartmentClicked', 'deleteDepartmentClicked', 'addPermissionsClicked'],
  setup,
  created: onCreated,
  methods: {
    getCurrentData,
    addEmailClicked,
    editEmailClicked,
    addPermissionsClicked,
    onSave,
    onDelete
  },
  template: TEMPLATE
};

export default StaffSidebarDepartment;
