
import React from 'react';
import { SystemUser } from '@/types/entities';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import UserForm, { UserFormValues } from './UserForm';
import ChangePasswordDialog from './ChangePasswordDialog';
import UserPermissionsDialog from './UserPermissionsDialog';

interface UserDialogsProps {
  editingUser: SystemUser | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  units: any[];
  deleteConfirmOpen: boolean;
  setDeleteConfirmOpen: (open: boolean) => void;
  handleDeleteUser: () => void;
  isPasswordDialogOpen: boolean;
  setIsPasswordDialogOpen: (open: boolean) => void;
  isPermissionsDialogOpen: boolean; 
  setIsPermissionsDialogOpen: (open: boolean) => void;
  selectedUser: SystemUser | null;
  refreshUsers: () => Promise<void>;
}

const UserDialogs: React.FC<UserDialogsProps> = ({
  editingUser,
  isDialogOpen,
  setIsDialogOpen,
  onSubmit,
  units,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  handleDeleteUser,
  isPasswordDialogOpen,
  setIsPasswordDialogOpen,
  isPermissionsDialogOpen,
  setIsPermissionsDialogOpen,
  selectedUser,
  refreshUsers
}) => {
  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            {editingUser && (
              <DialogDescription>
                Edite os detalhes do usuário. Deixe o campo de senha em branco para manter a senha atual.
              </DialogDescription>
            )}
          </DialogHeader>
          <UserForm 
            user={editingUser}
            units={units}
            onSubmit={onSubmit}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 text-white hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        user={selectedUser}
      />
      
      <UserPermissionsDialog
        isOpen={isPermissionsDialogOpen}
        onClose={() => setIsPermissionsDialogOpen(false)}
        user={selectedUser}
        onSaved={refreshUsers}
      />
    </>
  );
};

export default UserDialogs;
