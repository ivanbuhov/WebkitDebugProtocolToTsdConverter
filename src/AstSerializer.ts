import * as stream from 'stream';
import * as ts from './TypeScriptAst';

export class SerializationContext {
    private tabLevel: number = 0;
    private tab: string = '    ';
    
    public getTabLevel(): number {
        return this.tabLevel;
    }
    
    public getTab(): string {
        return this.tab;
    }
    
    constructor(tabLevel?: number, tab?: string) {
        this.tabLevel = tabLevel === undefined ? this.tabLevel : tabLevel;
        this.tab = tab === undefined ? this.tab : tab;
    }

    public indented(level: number = 1) {
        return new SerializationContext( this.tabLevel + level, this.tab );
    }
}

export class AstSerializer {
    private output: stream.Writable;
    
    constructor(output: stream.Writable) {
        this.output = output;
    }
    
    public writeNamespace(namespace: ts.Namespace, context: SerializationContext) {
        if (namespace.comment) {
            this.writeLine(`// ${namespace.comment}`, context);
        }
        let declare = namespace.isDeclaration ? 'declare ' : '';
        this.writeLine(`${declare}namespace ${namespace.name} {`, context);
        
        let indentedContext: SerializationContext = context.indented();
        
        for (let innerNamespace of namespace.namespaces) {
            this.writeLine('', indentedContext);
            this.writeNamespace(innerNamespace, indentedContext);
        }
        
        for (let tsTypedef of namespace.typedefs) {
            this.writeLine('', indentedContext);
            this.writeTypedef(tsTypedef, indentedContext);
        }
        
        for (let tsInterface of namespace.interfaces) {
            this.writeLine('', indentedContext);
            this.writeInterface(tsInterface, indentedContext);
        }
        
        this.writeLine('}', context);
    }
    
    public writeTypedef(typedef: ts.Typedef, context: SerializationContext) {
        this.writeLine(`type ${typedef.name} = ${typedef.oldTypeName}; // ${typedef.comment}`, context);
    }
    
    public writeInterface(tsInterface: ts.Interface, context: SerializationContext) {
        if (tsInterface.comment) {
            this.writeLine(`// ${tsInterface.comment}`, context);
        }
        this.writeLine(`interface ${tsInterface.name} {`, context);
        for (let property of tsInterface.properties) {
            this.writeProperty(property, context.indented());
        }
        // write call signature
        if (tsInterface.callSignature) {
            this.writeCallSignature(tsInterface.callSignature, context.indented());
        }
        this.writeLine('}', context);
    }
    
    public writeProperty(property: ts.Property, context: SerializationContext) {
        this.writeLine(`${property.name}${property.isOptional ? '?' : ''}: ${property.type}; // ${property.comment}`, context);
    }
    
    public writeCallSignature(callSignature: ts.CallSignature, context: SerializationContext) {
        if (callSignature.parameters.length == 0) {
            this.writeLine(`(): ${callSignature.returnType}`, context);
        }
        else {
            let paramStrings: string[] = callSignature.parameters.map<string>((p, i, a) => this.getParamString(p, i == a.length - 1));
            this.writeLine(`(${paramStrings.length > 0 ? paramStrings[0] : ''}`, context);
            for (let i = 1; i < paramStrings.length; i++) {
                this.writeLine(paramStrings[i], context);
            }
            this.writeLine(`): ${callSignature.returnType};`, context);
        }
    }
    
    private getParamString(param: ts.FunctionParameter, isLast: boolean): string {
        return `${param.name}${param.isOptional ? '?' : ''}: ${param.type}${isLast ? '' : `,`} // ${param.comment}`;
    }
    
    public writeLine(value: string, context: SerializationContext) {
        for (let i = 0; i < context.getTabLevel(); i++) {
            this.write(context.getTab());
        }
        this.write(`${value}\n`);
    }
    
    public write(value: string) {
        this.output.write(value);
    }
}