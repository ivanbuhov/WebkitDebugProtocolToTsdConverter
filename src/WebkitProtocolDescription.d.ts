export interface IDescribable {
    description: string;
}

export interface Domain extends IDescribable {
    domain: string;
    types?: TypeDefinition[];
    commands?: Command[];
    events?: Event[];
}

export interface TypeDefinition extends IDescribable {
    id: string;
    type: string;
    properties?: TypeProperty[];
}

export interface TypeRef {
    type?: string;
    $ref?: string;
    items?: TypeRef;
}

export interface TypeProperty extends TypeRef, IDescribable {
    name: string;
    optional?: boolean;
}

export interface Event extends IDescribable {
    name: string;
    parameters?: TypeProperty[];
}

// The command has the same signature as event thus we can reuse the class
export interface Command extends Event {
    returns?: TypeProperty[];
}