import { Drawer, ListItemButton, ListItemText, List } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SidebarMenu = ({ open, onClose, items = [] }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "var(--color-peach)",
            width: 260,
            paddingTop: "var(--space-2xl)",
            paddingX: "var(--space-md)",
          },
        },
      }}
    >
      <List
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          padding: 0,
        }}
      >
        {items.map(({ label, to }) => (
          <ListItemButton
            key={label}
            onClick={() => handleNavigate(to)}
            sx={{
              borderRadius: "var(--radius-md)",
              paddingY: "var(--space-sm)",
              paddingX: "var(--space-lg)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.06)",
              },
            }}
          >
            <ListItemText
              primary={label}
              slotProps={{
                primary: {
                  sx: {
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                  },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default SidebarMenu;
