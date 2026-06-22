import React from "react";
import Header from "../../components/layout/Header/Header.jsx";

const UserForm = () => {
  return (
    <div>
      <Header
        showMenu={true}
        showFullLogo={true}
        showSearch={true}
        navItems={[
          { label: "Usuarios", to: "/admin/usuarios" },
          { label: "Coreografías", to: "/coreografias" },
        ]}
        menuItems={[
          // ← items exclusivos del sidebar
          { label: "Lista de usuarios", to: "/admin/usuarios" },
          { label: "Crear usuario", to: "/admin/usuarios/new" },
        ]}
      />
    </div>
  );
};

export default UserForm;
