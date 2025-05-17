import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserRole, AssignableUserRole } from '../interfaces/entity.interface';

@ValidatorConstraint({ async: false })
export class IsAssignableUserRoleConstraint
  implements ValidatorConstraintInterface
{
  validate(role: any): boolean {
    // Check if the role is one of the assignable roles (not ANY)
    const assignableRoles: AssignableUserRole[] = [
      UserRole.IT_ADMIN,
      UserRole.ZONAL_DIRECTOR,
      UserRole.PRINCIPAL,
      UserRole.SCHOOL_ADMIN,
      UserRole.TEACHER,
      UserRole.STAFF,
    ];

    return assignableRoles.includes(role);
  }

  defaultMessage(): string {
    return 'Role must be one of: it_admin, zonal_director, principal, school_admin, teacher, staff. The role "any" cannot be assigned to users.';
  }
}

export function IsAssignableUserRole(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAssignableUserRoleConstraint,
    });
  };
}
