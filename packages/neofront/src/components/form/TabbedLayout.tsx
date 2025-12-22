//
// Renders a form with tabs, delegating each tab's content to FormLayout.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  name: string;
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const layout = viewResult.form.layout;
  const tabs: TabSchema[] = layout?.tabs ?? [];

  // Get active tab from URL or default to first tab's name
  const tabParam = searchParams.get("tab");
  const activeTab = tabs.find(t => t.name === tabParam)?.name ?? tabs[0]?.name ?? "";

  // #endregion

  return (
    <Tabs
      value={activeTab}
      onChange={(value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("tab", value!);
        navigate(`?${newParams.toString()}`, { replace: true });
      }}
    >
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.name} value={tab.name}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.name} value={tab.name} pt="md">
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
