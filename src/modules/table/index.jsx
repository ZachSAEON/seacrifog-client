import React, { PureComponent } from 'react'
import debounce from '../../lib/debounce'
import { mergeLeft } from 'ramda'
import { log } from '../../lib/log'
import { Toolbar, TextField, FontIcon, DataTable, TableHeader, TableRow, TableColumn, TableBody, TablePagination, Button } from 'react-md'

export default class extends PureComponent {
  state = {}
  headers = {}

  constructor(props) {
    super(props)
    this.rows = this.props.data.length
    this.state.slice = [0, 5]
    this.state.searchValue = this.props.initialSearch ? this.props.initialSearch : ''

    // Some headers shouldn't get column names
    this.invisibleHeaders = this.props.invisibleHeaders || []

    // Some columns should ignore row clicks
    this.unlickableCols = this.props.unlickableCols || []

    // Setup headers for keeping header-column values aligned
    this.props.headers.forEach((h, i) => (this.headers[h] = i))
  }

  getFilteredData = searchValue => {
    const filteredData = this.props.data.filter(p => {
      const term = searchValue.toUpperCase().trim()
      if (term === '') return true
      else {
        // TODO: This is currently a bug in react-scripts 3.1.1
        // eslint-disable-next-line
        for (const key in p) {
          const value = (p[key] || '')
            .toString()
            .toUpperCase()
            .trim()
          if (value.indexOf(term) >= 0) return true
        }
      }
      return false
    })
    return filteredData
  }

  getDataSlice = data => {
    const { slice } = this.state
    return data.slice(slice[0], slice[1])
  }

  handlePagination = (start, rowsPerPage) => {
    this.setState({ slice: [start, start + rowsPerPage] })
  }

  render() {
    const { searchValue } = this.state
    const { selectedRow, toolbarButtons, toolbarStyle } = this.props
    const { headers, invisibleHeaders: specialHeaders } = this
    const resetForm = this.props.resetForm || null
    const onRowHover = this.props.onRowHover || (() => log('Row hover changed'))
    const onRowClick = this.props.onRowClick || (() => log('Row selection changed'))

    return (
      <>
        <Toolbar style={mergeLeft(toolbarStyle, { display: 'flex', alignItems: 'center' })} themed zDepth={0}>
          <TextField
            id="table-search"
            style={{ marginLeft: '20px', display: 'flex' }}
            block={true}
            autoComplete={'off'}
            value={searchValue}
            onChange={val => this.setState({ searchValue: val })}
            placeholder="Search by table fields..."
            leftIcon={<FontIcon>search</FontIcon>}
          />
          {(toolbarButtons || []).concat(
            <Button
              key={'reset-form-button'}
              primary
              tooltipPosition={'left'}
              disabled={selectedRow || searchValue ? false : true}
              tooltipLabel={'Reset the form'}
              style={{ display: 'flex', marginRight: '20px' }}
              icon
              onClick={() => {
                this.setState({ searchValue: '' })
                if (resetForm) resetForm()
              }}
            >
              refresh
            </Button>
          )}
        </Toolbar>
        <DataTable baseId="paginated-table" plain>
          <TableHeader>
            <TableRow>
              {Object.keys(headers).map((header, i) => (
                <TableColumn role="button" key={i} style={{ textAlign: 'center' }}>
                  {specialHeaders.includes(header) ? '' : header}
                </TableColumn>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody onMouseLeave={() => onRowHover(null)}>
            {this.getDataSlice(this.getFilteredData(searchValue)).map((row, i) => (
              <TableRow
                className={row.id === (selectedRow || {}).id ? 'selected-row' : ''}
                key={i}
                onMouseOver={debounce(() => onRowHover(row), 5)}
                onClick={() => {
                  if (!onRowClick) return
                  else if ((selectedRow || {}).id !== row.id) onRowClick(row)
                  else onRowClick(null)
                }}
              >
                {(row => {
                  const cols = []
                  Object.keys(row)
                    .filter(col => col !== '__typename' && col !== 'id')
                    .forEach((col, j) => {
                      // Get the header index
                      const index = headers[col]
                      cols[index] = (
                        <TableColumn plain={false} key={j} style={{ cursor: 'pointer' }}>
                          {row[col] === null || row[col] === undefined
                            ? '-'
                            : row[col].constructor === String
                            ? row[col].toString().truncate(70, '..')
                            : row[col]}
                        </TableColumn>
                      )
                    })
                  return cols
                })(row)}
              </TableRow>
            ))}
          </TableBody>
          <TablePagination
            defaultRowsPerPage={5}
            rowsPerPageItems={[5, 10, 25, 50]}
            rows={this.getFilteredData(searchValue).length}
            rowsPerPageLabel={'Rows'}
            onPagination={this.handlePagination}
          />
        </DataTable>
      </>
    )
  }
}
