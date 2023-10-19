/* globals Vue */
const PROPS = {
  isDepartment: Boolean,
  department: Object
}

const TEMPLATE = `
  <div class="UI-table-row CONCOM-table-head" :id="'table_header_' + htmlTagFriendlyName(department).value">
    <div class="UI-table-cell-no-border" v-if="isDepartment">Department</div>
    <div class="UI-table-cell" v-if="isDepartment">Division</div>
    <div class="UI-table-cell-no-border" v-if="!isDepartment">Division</div>
    <div class="UI-table-cell-no-border">Name</div>
    <div class="UI-table-cell-no-border">Pronouns</div>
    <div class="UI-table-cell-no-border">Position</div>
    <div class="UI-table-cell-no-border" v-if="isDepartment">Email</div>
    <div class="UI-table-cell-no-border">Note</div>
    <div class="UI-table-cell-no-border"></div>
  </div>
`;

const htmlTagFriendlyName = (department) => Vue.computed(() => {
  return department.name.replaceAll(' ', '_');
});

const INITIAL_DATA = () => {
  return {
    htmlTagFriendlyName
  }
};

const departmentHeaderComponent = {
  props: PROPS,
  template: TEMPLATE,
  data: INITIAL_DATA
};

export default departmentHeaderComponent;