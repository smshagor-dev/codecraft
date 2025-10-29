import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode, Button } from "@chakra-ui/react";

export const ColorModeToggler = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const onColorModeChange = () => {
    toggleColorMode();
    const currentColorMode =
      localStorage.getItem("colorMode") === "light" ? "dark" : "light";
    localStorage.setItem("colorMode", currentColorMode);
  };

  return (
    <div>
      <Button
        onClick={onColorModeChange}
        _hover={{ bg: "gray.200" }}
        _dark={{ _hover: { bg: "gray.700" } }}
      >
        {colorMode === "dark" ? (
          <SunIcon color="black" _dark={{ color: "white" }} />
        ) : (
          <MoonIcon color="black" _dark={{ color: "white" }} />
        )}
      </Button>
    </div>
  );
};
