// hooks/usePermission.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const usePermission = (permissionName) => {
  const { user } = useContext(AuthContext);
  const permissions = user?.role?.permissions || [];
  return permissions.some(p => p.permission_name === permissionName);
};

export default usePermission;
