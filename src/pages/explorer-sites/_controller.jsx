import React, { PureComponent } from 'react'
import sift from 'sift'
import { Button } from 'react-md'
import { Map, clusterSource, clusterLayer, ahocevarBaseMap, SingleFeatureSelector } from '@saeon/atlas'
import { GlobalStateContext } from '../../global-state'
import { SideMenu, DropdownSelect } from '../../modules/shared-components'
import ApplySitesFilter from './_apply-sites-filter'
import FeatureDetail from './_feature-detail'

const sideMenuContentStyle = { paddingLeft: '24px', paddingRight: '24px' }

export default class extends PureComponent {
  constructor(props) {
    super(props)

    // Specify the data
    const data = {}
    this.data = data
    data.sites = props.data.sites
    data.xrefSitesNetworks = props.data.xrefSitesNetworks
    data.networks = props.data.networks.filter(sift({ id: { $in: data.xrefSitesNetworks.map(x => x.network_id) } }))
    data.xrefNetworksVariables = props.data.xrefNetworksVariables.filter(
      sift({ network_id: { $in: data.networks.map(x => x.id) } })
    )
    data.variables = props.data.variables.filter(
      sift({ id: { $in: data.xrefNetworksVariables.map(x => x.variable_id) } })
    )
    data.xrefProtocolsVariables = props.data.xrefProtocolsVariables.filter(
      sift({ variable_id: { $in: data.variables.map(v => v.id) } })
    )
    data.protocols = props.data.protocols.filter(
      sift({ id: { $in: data.xrefProtocolsVariables.map(x => x.protocol_id) } })
    )

    // Create layers
    this.clusteredSites = clusterSource({ data: data.sites, locAttribute: 'xyz' })
    this.clusteredSitesLayer = clusterLayer(this.clusteredSites, 'sites')
    this.layers = [ahocevarBaseMap(), this.clusteredSitesLayer]
  }

  render() {
    const { layers, data } = this
    const {
      sites,
      networks,
      variables,
      protocols,
      xrefSitesNetworks,
      xrefNetworksVariables,
      xrefProtocolsVariables
    } = data

    return (
      <GlobalStateContext.Consumer>
        {({ updateGlobalState, selectedSites, selectedNetworks, selectedVariables, selectedProtocols }) => (
          <Map style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} layers={layers}>
            {({ map }) => (
              <ApplySitesFilter
                sites={sites}
                selectedSites={selectedSites}
                selectedNetworks={selectedNetworks}
                selectedVariables={selectedVariables}
                selectedProtocols={selectedProtocols}
                xrefSitesNetworks={xrefSitesNetworks}
                xrefNetworksVariables={xrefNetworksVariables}
                xrefProtocolsVariables={xrefProtocolsVariables}
                updateMapLayer={({ source }) => this.clusteredSitesLayer.setSource(source)}
              >
                {/* Side Filter menu */}
                <SideMenu
                  toolbarActions={[
                    <Button
                      disabled={
                        selectedSites.length ||
                        selectedNetworks.length ||
                        selectedVariables.length ||
                        selectedProtocols.length
                          ? false
                          : true
                      }
                      primary
                      onClick={() =>
                        updateGlobalState({
                          selectedSites: [],
                          selectedNetworks: [],
                          selectedVariables: [],
                          selectedProtocols: []
                        })
                      }
                      icon
                    >
                      refresh
                    </Button>
                  ]}
                  control={({ toggleMenu }) => (
                    <Button
                      style={{ position: 'absolute', top: 0, right: 0, margin: '10px', zIndex: 1 }}
                      swapTheming
                      primary
                      icon
                      onClick={toggleMenu}
                    >
                      filter_list
                    </Button>
                  )}
                >
                  <div style={sideMenuContentStyle}>
                    {/* Sites filter */}
                    <DropdownSelect
                      id={'dropdown-select-sites'}
                      label={'Filter sites'}
                      selectedItems={selectedSites}
                      items={sites.map(({ id, name: value }) => ({ id, value }))}
                      onItemToggle={id =>
                        updateGlobalState({
                          selectedSites: selectedSites.includes(id)
                            ? [...selectedSites].filter(sId => sId !== id)
                            : [...selectedSites, id]
                        })
                      }
                    />
                    {/* Networks filter */}
                    <DropdownSelect
                      id={'dropdown-select-networks'}
                      label={'Filter networks'}
                      selectedItems={selectedNetworks}
                      items={networks.map(({ id, acronym: value }) => ({ id, value }))}
                      onItemToggle={id =>
                        updateGlobalState(
                          {
                            selectedNetworks: selectedNetworks.includes(id)
                              ? [...selectedNetworks].filter(nId => nId !== id)
                              : [...selectedNetworks, id]
                          },
                          { currentIndex: 'currentNetwork', selectedIds: 'selectedNetworks' }
                        )
                      }
                    />
                    {/* Variables filter */}
                    <DropdownSelect
                      id={'dropdown-select-variables'}
                      label={'Filter variables'}
                      selectedItems={selectedVariables}
                      items={variables.map(({ id, name: value }) => ({ id, value }))}
                      onItemToggle={id =>
                        updateGlobalState(
                          {
                            selectedVariables: selectedVariables.includes(id)
                              ? [...selectedVariables].filter(vId => vId !== id)
                              : [...selectedVariables, id]
                          },
                          { currentIndex: 'currentVariable', selectedIds: 'selectedVariables' }
                        )
                      }
                    />
                    {/* Protocols filter */}
                    <DropdownSelect
                      id={'dropdown-select-protocols'}
                      label={'Filter protocols'}
                      selectedItems={selectedProtocols}
                      items={protocols.map(({ id, title: value }) => ({ id, value }))}
                      onItemToggle={id =>
                        updateGlobalState(
                          {
                            selectedProtocols: selectedProtocols.includes(id)
                              ? [...selectedProtocols].filter(pId => pId !== id)
                              : [...selectedProtocols, id]
                          },
                          { currentIndex: 'currentProtocol', selectedIds: 'selectedProtocols' }
                        )
                      }
                    />
                  </div>
                </SideMenu>

                {/* Feature click panel, all shown features, WITH menu */}
                <SideMenu
                  style={{ minWidth: '100%', overflowY: 'auto', zIndex: 999 }}
                  control={({ toggleMenu }) => (
                    <Button
                      swapTheming
                      primary
                      style={{ position: 'absolute', top: 50, right: 0, margin: '10px', zIndex: 1 }}
                      icon
                      onClick={toggleMenu}
                    >
                      bar_chart
                    </Button>
                  )}
                >
                  <div style={{ padding: 0, height: 'calc(100% - 67px)' }}>
                    <FeatureDetail
                      toolbarActions={[
                        <Button onClick={() => alert('TODO')} icon>
                          save_alt
                        </Button>
                      ]}
                      getFeatureIds={() => {
                        let layer = null
                        map.getLayers().forEach(l => (layer = l.get('id') === 'sites' ? l : layer))
                        return layer
                          .getSource()
                          .getFeatures()
                          .map(feature => feature.get('features'))
                          .flat()
                          .map(feature => feature.get('id'))
                      }}
                      map={map}
                    />
                  </div>
                </SideMenu>

                {/* Feature click panel (individual feature, no menu) */}
                <SingleFeatureSelector map={map}>
                  {({ selectedFeature, unselectFeature }) =>
                    selectedFeature ? (
                      <div
                        style={{
                          zIndex: 1,
                          position: 'absolute',
                          margin: '12px 0 12px 12px',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          right: 64,
                          display: selectedFeature ? 'inherit' : 'none',
                          opacity: 0.8
                        }}
                      >
                        <FeatureDetail
                          toolbarActions={[
                            <Button onClick={() => alert('TODO')} icon>
                              save_alt
                            </Button>,
                            <Button onClick={unselectFeature} icon>
                              close
                            </Button>
                          ]}
                          getFeatureIds={() => selectedFeature.get('features').map(feature => feature.get('id'))}
                        />
                      </div>
                    ) : (
                      ''
                    )
                  }
                </SingleFeatureSelector>
              </ApplySitesFilter>
            )}
          </Map>
        )}
      </GlobalStateContext.Consumer>
    )
  }
}
