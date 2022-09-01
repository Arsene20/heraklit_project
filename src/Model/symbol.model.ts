class Symbol {
    name: string
    _type: string
    value: Map<string, Symbol> = new Map()
}

export default Symbol;