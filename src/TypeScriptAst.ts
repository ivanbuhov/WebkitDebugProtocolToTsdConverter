export interface IComment {
    comment: string;
}

export class Namespace implements IComment {
    
    constructor(name: string, isDeclaration: boolean = false, comment: string = '') {
        this.name = name;
        this.isDeclaration = isDeclaration;
        this.comment = comment;
        this.namespaces = [];
        this.interfaces = [];
        this.typedefs = [];
    }
    
    name: string;
    isDeclaration: boolean;
    comment: string;
    namespaces: Namespace[];
    interfaces: Interface[];
    typedefs: Typedef[];
}

export class Typedef implements IComment {
    
    constructor(name: string, oldTypeName: string, comment: string = '') {
        this.name = name;
        this.oldTypeName = oldTypeName;
        this.comment = comment;
    }
    
    name: string;
    oldTypeName: string;
    comment: string;
}

export class Interface implements IComment {
    
    constructor(name: string, comment: string = '') {
        this.name = name;
        this.comment = comment;
        this.properties = [];
    }
    
    name: string;
    comment: string;
    properties: Property[];
    callSignature: CallSignature;
}

export class Property implements IComment {
    
    constructor(name: string, type: string, isOptional: boolean = false, comment: string = '') {
        this.name = name;
        this.type = type;
        this.isOptional = isOptional;
        this.comment = comment;
    }
    
    name: string;
    type: string;
    isOptional: boolean;
    comment: string;
}

export class CallSignature implements IComment {
    
    constructor(returnType: string, comment: string = '') {
        this.returnType = returnType;
        this.comment = comment;
        this.parameters = [];
    }
    
    returnType: string;
    comment: string;
    parameters: FunctionParameter[];
}

export class FunctionParameter implements IComment {
    
    constructor(name: string, type: string, isOptional: boolean = false, comment: string = '') {
        this.name = name;
        this.type = type;
        this.isOptional = isOptional;
        this.comment = comment;
    }
    
    name: string;
    type: string;
    isOptional: boolean;
    comment: string;
}