/* globals apiRequest */

function getDepartmentParams(sidebarData) {
  let params = `Name=${sidebarData.departmentName}`;
  if (sidebarData.fallbackDepartment?.id != null) {
    params += `&FallbackID=${sidebarData.fallbackDepartment.id}`;
  }

  if (sidebarData.parentDepartment?.id != null) {
    params += `&ParentID=${sidebarData.parentDepartment.id}`;
  }

  return params;
}

async function saveDepartment(data) {
  const { sidebarData } = data;
  const params = getDepartmentParams(sidebarData);

  await apiRequest('POST', 'department', params);
}

async function updateDepartment(data) {
  const { sidebarData } = data;
  const params = getDepartmentParams(sidebarData);

  await apiRequest('PUT', `department/${sidebarData.id}`, params);
}


export function useSidebarActions() {
  async function saveSidebarData(data) {
    if (data.eventName === 'saveDepartment') {
      if (data.sidebarData?.id > 0) {
        await updateDepartment(data);
      } else {
        await saveDepartment(data);
      }
    }
  }

  return { saveSidebarData };
}
