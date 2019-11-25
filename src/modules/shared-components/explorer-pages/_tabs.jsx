import React, { useState } from 'react'
import { Grid, Cell, TabsContainer, Tabs, Tab, Avatar } from 'react-md'

const avatarStyle = {
  fontSize: '10px'
}

const getTabIndex = (currentIndex, maxIndex) => (currentIndex > maxIndex ? maxIndex : currentIndex)

export default ({ selectedIds, id, children }) => {
  const [tabIndex, setTabIndex] = useState(0)
  return (
    <Grid noSpacing>
      <Cell size={12}>
        {selectedIds.length > 0 ? (
          <TabsContainer
            activeTabIndex={tabIndex ? getTabIndex(tabIndex, selectedIds.length - 1) : 0}
            onTabChange={newTabIndex => setTabIndex(newTabIndex)}
            colored
          >
            <Tabs tabId={id}>
              {selectedIds.map((id, i) => (
                <Tab
                  key={i}
                  icon={<Avatar key={i} children={id} contentStyle={avatarStyle} suffix="blue-grey" iconSized />}
                >
                  <Grid>
                    <Cell size={12}>{children({ id })}</Cell>
                  </Grid>
                </Tab>
              ))}
            </Tabs>
          </TabsContainer>
        ) : (
          <Grid>
            <Cell size={12}>
              <p>No rows selected</p>
            </Cell>
          </Grid>
        )}
      </Cell>
    </Grid>
  )
}