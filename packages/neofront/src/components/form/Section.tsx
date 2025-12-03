//
// Renders a section (accordion) in a record form.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import { Accordion } from "@mantine/core";

import { useAppUI } from "context";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface SectionSchema {
  columns: string[][];
  title?: string;
  initialState?: "collapsed" | "expanded" | "fixed" | "hidden";
}

interface SectionProps {
  schema: SectionSchema;
  contents: JSX.Element;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function Section(props: SectionProps): JSX.Element {

  // #region Hooks and state

  const { schema, contents } = props;
  const { appCfg } = useAppUI();
  const outlined = appCfg?.forms.outlinedSections;

  const validStates = ['collapsed', 'expanded', 'fixed', 'hidden'];
  if (schema.initialState && !validStates.includes(schema.initialState)) {
    console.warn(`Invalid initialState "${schema.initialState}" in section "${schema.title}".`);
  }

  if (schema.initialState === 'hidden') {
    return <>{contents}</>;
  }

  const fixedStyles = schema.initialState === 'fixed' ? {
    pointerEvents: 'none' as const,
    cursor: 'default' as const
  } : {};

  const outlinedStyles = {
    item: {},
    control: { ...fixedStyles },
    content: { paddingBottom: 32 },
    chevron: schema.initialState === 'fixed' ? { display: 'none' } : {}
  };

  const defaultStyles = {
    item: { border: 'none' },
    control: { ...fixedStyles, paddingLeft: 0, },
    content: { paddingLeft: 0, paddingRight: 0, paddingBottom: 32 },
    chevron: schema.initialState === 'fixed' ? { display: 'none' } : {}
  };

  // #endregion

  return (
    <Accordion
      defaultValue={schema.initialState !== "collapsed" ? "item_1" : undefined}
      variant={outlined ? "separated" : "default"}
      py={outlined ? "sm" : undefined}
      chevronIconSize={22}
      className={outlined ? "nf-outlined" : "nf-open"}
      styles={outlined ? outlinedStyles : defaultStyles}
    >
      <Accordion.Item key="item_1" value="item_1">
        <Accordion.Control>{schema.title || '[No title]'}</Accordion.Control>
        <Accordion.Panel>{contents}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

// #endregion
