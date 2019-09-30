import React from 'react'
import { DATAPRODUCTS_MIN, DATAPRODUCT } from '../../graphql/queries'
import Table from '../../modules/table'
import TitleToolbar from '../../modules/title-toolbar'
import { mergeLeft, pickBy } from 'ramda'
import { NoneMessage, FormattedInfo, LinkButton, DownloadButton, EditButton } from '../../modules/shared-components'
import { Grid, Cell, ExpansionList, ExpansionPanel, Card } from 'react-md'
import CoverageMap from './coverage-map'
import q from 'query-string'
import DataQuery from '../../modules/data-query'

export default ({ updateForm, hoveredDP, selectedDP, ...props }) => (
  <DataQuery query={DATAPRODUCTS_MIN}>
    {({ dataproducts }) => (
      <>
        {/* Page Heading */}
        <TitleToolbar
          t1={selectedDP ? selectedDP.title : hoveredDP ? hoveredDP.title : 'Select rows by clicking on them...'}
          t2={selectedDP ? selectedDP.provider : hoveredDP ? hoveredDP.provider : ''}
          t3={selectedDP ? selectedDP.publish_year : hoveredDP ? hoveredDP.publish_year : ''}
        />

        <Grid>
          <Cell size={12}>
            {/* Main Table (selectable) */}
            <Grid noSpacing>
              <Cell size={12}>
                <Card tableCard>
                  <Table
                    invisibleHeaders={['EDIT']}
                    headers={Object.keys(dataproducts[0] || '')
                      .filter(col => col !== '__typename' && col !== 'id')
                      .concat('EDIT')}
                    data={dataproducts.map(d => mergeLeft({ EDIT: <EditButton to={`/dataproducts/${d.id}`} /> }, d))}
                    initialSearch={
                      props.history.location.search
                        ? q.parse(props.history.location.search, { ignoreQueryPrefix: true }).searchTerm
                        : selectedDP
                        ? selectedDP.title
                        : ''
                    }
                    onRowClick={row => updateForm({ selectedDP: row })}
                    onRowHover={row => updateForm({ hoveredDP: row })}
                    selectedRow={selectedDP}
                    toolbarButtons={[
                      <LinkButton key={'url-button'} active={selectedDP ? false : true} />,
                      <DownloadButton key={'download-button'} active={selectedDP ? false : true} />
                    ]}
                    resetForm={() => updateForm({ selectedDP: null })}
                  />
                </Card>
              </Cell>

              <Cell size={12}>
                {/* Display information about selected row */}
                {selectedDP ? (
                  <DataQuery query={DATAPRODUCT} variables={{ id: selectedDP.id }}>
                    {({ dataproduct }) => (
                      <Grid noSpacing>
                        <Cell size={12}>
                          <ExpansionList>
                            <ExpansionPanel label="Abstract" defaultExpanded footer={false}>
                              <Grid>
                                <Cell size={12}>
                                  <p>{dataproduct.abstract}</p>
                                </Cell>
                              </Grid>
                            </ExpansionPanel>
                            <ExpansionPanel label="Additional Information" footer={false}>
                              {
                                <FormattedInfo
                                  object={pickBy((val, key) => {
                                    if (['abstract', '__typename'].includes(key)) return false
                                    if (typeof val === 'object') return false
                                    return true
                                  }, dataproduct)}
                                />
                              }
                            </ExpansionPanel>
                            <ExpansionPanel className="fix-panel-content-style" label="Spatial Coverage" footer={false}>
                              <div style={{ height: '500px' }}>
                                <CoverageMap geoJson={dataproduct.coverage_spatial} />
                              </div>
                            </ExpansionPanel>
                          </ExpansionList>
                        </Cell>
                        <Cell size={12}>
                          <h3 style={{ textAlign: 'center', marginTop: '100px', marginBottom: '50px' }}>Essential Variables</h3>
                          {dataproduct.variables[0] ? (
                            <Card tableCard>
                              <Table
                                onRowClick={row =>
                                  updateForm({ selectedVariable: row }, () => props.history.push(`/variables?searchTerm=${row.name}`))
                                }
                                headers={Object.keys(dataproduct.variables[0])
                                  .filter(col => col !== '__typename' && col !== 'id')
                                  .concat('relationship')}
                                data={dataproduct.variables.map(v => mergeLeft({ relationship: 'direct' }, v))}
                                tableStyle={{}}
                                toolbarButtons={[]}
                              />
                            </Card>
                          ) : (
                            <NoneMessage />
                          )}
                        </Cell>
                      </Grid>
                    )}
                  </DataQuery>
                ) : (
                  <Grid>
                    <Cell size={12}>
                      <p>
                        <i>Select a row for more detailed information</i>
                      </p>
                    </Cell>
                  </Grid>
                )}
              </Cell>
            </Grid>
          </Cell>
        </Grid>
      </>
    )}
  </DataQuery>
)
