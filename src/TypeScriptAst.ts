export interface IComment {
    comment: string;
}

export class Namespace implements IComment {
    
    constructor(name: string, isDeclaration: boolean = false, comment: string = '') {
        this.name = name;
        this.isDeclaration = isDeclaration;
        this.comment = comment;
        this.namespaces = [];
        this.types = [];
    }
    
    name: string;
    isDeclaration: boolean;
    comment: string;
    namespaces: Namespace[];
    types: Type[];
}

export type Type = Interface | Typedef;

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
        this.commentLines = [];
        this.properties = [];
        this.methods = [];
    }
    
    name: string;
    comment: string;
    commentLines: string[];
    properties: Property[];
    methods: Method[];
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

export class Method implements IComment {
    
    constructor(name: string, returnType: string, isOptional: boolean, comment: string = '') {
        this.name = name;
        this.returnType = returnType;
        this.isOptional = isOptional;
        this.parameters = [];
        this.comment = comment;
    }
    
    name: string;
    returnType: string;
    isOptional: boolean;
    parameters: MethodParameter[];
    comment: string;
}

export class MethodParameter implements IComment {
    
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