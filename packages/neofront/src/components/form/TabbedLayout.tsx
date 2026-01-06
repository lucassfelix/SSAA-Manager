//
// Renders a form with tabs, delegating each tab's content to FormLayout.
//

// #region --------------------------------------------------------------------------------- Imports

import { JSX } from "react";
import type { Property } from "csstype";
import { useNavigate } from "react-router-dom";
import { MantineRadius, Tabs } from "@mantine/core";

import { ListViewProps, RecordConfig, useAppUI } from "context";
import { FormOperationType } from "./Form";
import FormLayout from "./FormLayout";
import { SectionSchema } from "./Section";
import NfListView from "@/listView/ListView";
import NfIcon from "@/icon/NfIcon";

// #endregion

// #region ----------------------------------------------------------------------------------- Types

export interface TabSchema {
  label: string;
  name: string;
  icon?: string;
  textColor?: string;
  iconColor?: string;
  header?: string[];
  sections?: SectionSchema[];
  listView?: ListViewProps;
}

export interface TabThemeProps {
  justify?: Property.JustifyContent;
  color?: string;
  variant?: 'default' | 'outline' | 'pills';
  radius?: MantineRadius;
  iconSize?: string | number;
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
  const { viewResult, appCfg, currentSearchParams } = useAppUI();
  const navigate = useNavigate();

  const layout = viewResult.form.layout;
  const tabs: TabSchema[] = layout?.tabs ?? [];
  const tabsTheme = appCfg.forms.tabs ?? {};

  // Get active tab from URL or default to first tab's name
  const tabParam = currentSearchParams.get("tab");
  const activeTab = tabs.find(t => t.name === tabParam)?.name ?? tabs[0]?.name ?? "";

  // #endregion

  return (
    <Tabs
      value={activeTab}
      variant={tabsTheme.variant || "default"}
      color={tabsTheme.color || undefined}
      radius={tabsTheme.radius || "md"}
      onChange={(value) => {
        const newParams = new URLSearchParams(currentSearchParams);
        newParams.set("tab", value!);
        navigate(`?${newParams.toString()}`, { replace: true });
      }}
    >
      <Tabs.List justify={tabsTheme.justify || 'flex-start'}>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.name}
            value={tab.name}
            styles={{tabLabel: { color: tab.textColor }}}
            leftSection={tab.icon ? <NfIcon
              icon={tab.icon}
              color={tab.iconColor}
              size={tabsTheme.iconSize || 16}
            /> : undefined}
          >
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
