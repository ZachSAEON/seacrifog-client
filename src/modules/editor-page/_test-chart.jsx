import React, { PureComponent } from 'react'
import ECharts from 'echarts-for-react'
import echartsTheme from '../../lib/echarts-theme'
export default class extends PureComponent {
  render() {
    return (
      <div style={{ height: '400px' }}>
        <ECharts
          style={{ height: '100%' }}
          notMerge={true}
          lazyUpdate={false}
          theme={echartsTheme}
          onEvents={{
            click: event => {
              console.log('Pie has been clicked!')
              console.log(event)
              alert(event.data.value + ' ' + event.data.name)
            }
          }}
          option={{
            series: [
              {
                data: this.props.data,
                type: 'pie'
              }
            ]
          }}
        />
      </div>
    )
  }
}