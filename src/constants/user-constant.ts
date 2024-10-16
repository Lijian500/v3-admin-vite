enum UserStateEnum {
  Enabled = 1,
  Disabled
}

enum IdentityEnum {
  /** 超级管理员*/
  SuperAdmin = 1,
  /** 普通管理员*/
  Admin
}

interface ISimpleCommonStateInfo {
  sort: number;
  value: number;
  text: string;
}

const UserStateData: Record<UserStateEnum, ISimpleCommonStateInfo> = {
  [UserStateEnum.Enabled]: {
    sort: 1,
    value: UserStateEnum.Enabled,
    text: '启用'
  },
  [UserStateEnum.Disabled]: {
    sort: 2,
    value: UserStateEnum.Disabled,
    text: '禁用'
  }
}

const IdentityData: Record<IdentityEnum, ISimpleCommonStateInfo> = {
  [IdentityEnum.SuperAdmin]: {
    sort: 1,
    value: IdentityEnum.SuperAdmin,
    text: '超级管理员'
  },
  [IdentityEnum.Admin]: {
    sort: 2,
    value: IdentityEnum.Admin,
    text: '普通管理员'
  }
}



function getUserStateEnum(value: number){
  return UserStateEnum[value];
}

function getUserStateText(value: UserStateEnum){
  return UserStateData[value].text
}


export {UserStateEnum, IdentityEnum}
