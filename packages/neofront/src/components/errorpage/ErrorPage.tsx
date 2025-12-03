//
// Renders a generic error page with a message and an image.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import { Center, Image, Stack, Text } from "@mantine/core";
import { useAppUI } from "context";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

interface ErrorPageProps {
  message: string;
  image?: string;
  fullHeight?: boolean;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function ErrorPage(props: ErrorPageProps): JSX.Element {

  // #region Hooks and variables

  const { message, image, fullHeight } = props;
  const { appCfg } = useAppUI();
  const headerHeight = appCfg.shell.header.height;

  // #endregion

  return (
    <Center h={fullHeight ? `calc(100vh - ${headerHeight}px)` : undefined} w="100%">
      <Stack gap="xl">
        <Text c="dimmed" ta="center" dangerouslySetInnerHTML={{ __html: message }} />
        {image && <Image src={`${appCfg.paths.images}${image}.svg`} alt={image} maw={400} />}
      </Stack>
    </Center>
  );
}

// #endregion
