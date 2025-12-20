//
// Renders a form with tabs, delegating each tab's content to FormLayout.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX, useState } from "react";
import { Tabs } from "@mantine/core";

import { ListViewProps, RecordConfig, useAppUI } from "context";
import { FormOperationType } from "./Form";
import FormLayout from "./FormLayout";
import { SectionSchema } from "./Section";
import NfListView from "@/listView/ListView";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface TabSchema {
  label: string;
  header?: string[];
  sections?: SectionSchema[];
  listView?: ListViewProps;
}

interface TabbedLayoutProps {
  op: FormOperationType;
  recordCfg: RecordConfig;
  record?: Record<string, any>;
}

// #endregion

// #region ------------------------------------------------------------------------------- Component

export default function TabbedLayout(props: TabbedLayoutProps): JSX.Element {

  // #region Hooks and variables

  const { op, recordCfg, record } = props;
  const { viewResult } = useAppUI();
  const [activeTab, setActiveTab] = useState<string | null>("0");

  const layout = viewResult.form.layout;
  const tabs: TabSchema[] = layout?.tabs ?? [];

  // #endregion

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tabs.List>
        {tabs.map((tab, idx) => (
          <Tabs.Tab key={idx} value={String(idx)}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab, idx) => (
        <Tabs.Panel key={idx} value={String(idx)} pt="md">
          {tab.listView ? (
            <NfListView
              viewSchema={tab.listView}
              records={record?.[tab.listView.name]}
            />
          ) : (
            <FormLayout
              op={op}
              recordCfg={recordCfg}
              record={record}
              formLayout={{ header: tab.header, sections: tab.sections! }}
            />
          )}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

// #endregion
