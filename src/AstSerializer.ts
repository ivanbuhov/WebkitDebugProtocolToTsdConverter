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
        
        for (let tsType of namespace.types) {
            this.writeLine('', indentedContext);
            if (tsType instanceof ts.Typedef)
                this.writeTypedef(tsType, indentedContext);
            else if (tsType instanceof ts.Interface)
                this.writeInterface(tsType, indentedContext);
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
        for (let method of tsInterface.methods) {
            this.writeMethod(method, context.indented());
        }
        for (let commentLine of tsInterface.commentLines) {
            this.writeCommentLine(commentLine, context.indented());
        }
        this.writeLine('}', context);
    }
    
    public writeProperty(property: ts.Property, context: SerializationContext) {
        this.writeLine(`${property.name}${property.isOptional ? '?' : ''}: ${property.type}; // ${property.comment}`, context);
    }

    public writeMethod(method: ts.Method, context: SerializationContext) {
        let paramString = method.parameters.map<string>((p) => this.getParamString(p)).join(', ');
        this.writeLine(`${method.name}(${paramString}): ${method.returnType}; // ${method.comment ? `// ${method.comment}` : ''}`, context);
    }

    public writeCommentLine(commentLine: string, context: SerializationContext) {
        this.writeLine(`// ${commentLine}`, context);
    }
    
    private getParamString(param: ts.MethodParameter): string {
        return `${param.name}${param.isOptional ? '?' : ''}: ${param.type} ${param.comment ? `/* ${param.comment} */`: ''}`;
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