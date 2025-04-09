export type UserData = {
    user_id: number,
    clerk_id: string,
    first_name: string,
    last_name: string,
    email: string,
    phone_number: string,
    address: string,
    created_at: string,
    updated_at: string,
    user_type: UserType,
    organizations: Organization[],
    permissions: string[],
    latitude: number,
    longitude: number
}

export type UserType = {
    user_type_id: number,
    name: string,
    description: string
}

export type Organization = {
    organization_id: number,
    name: string,
    role: Role
}

export type Role = {
    role_id: number,
    name: string
}

