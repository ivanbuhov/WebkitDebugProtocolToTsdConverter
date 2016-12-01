import * as ts from './TypeScriptAst';
import * as wp from './WebkitProtocolDescription';

export class AstGenerator {
    
    public convertDomain(domain: wp.Domain): ts.Namespace {
        let namespace: ts.Namespace = new ts.Namespace(domain.domain, false, domain.description);
        
        if (domain.types) {
            for (let type of domain.types) {
                let tsType: ts.Type = this.convertType(type);
                namespace.types.push(tsType);
            }
        }
        
        let mainInterface = new ts.Interface(namespace.name, namespace.name);
        namespace.types.push(mainInterface);

        if (domain.commands) {
            for (let command of domain.commands) {
                let method: ts.Method = this.convertCommand(command, namespace.types);
                mainInterface.methods.push(method);
            }
        }

        if (domain.events) {
            for(let event of domain.events) {
                let method: ts.Method = this.convertEvent(event, namespace.types);
                mainInterface.methods.push(method);
            }
        }
        
        return namespace;
    }
    
    public convertType(type: wp.TypeDefinition): ts.Type {
        if (type.type == 'object') {
            let tsInterface: ts.Interface = new ts.Interface(type.id, type.description);
            if (type.properties) {
                for (let property of type.properties) {
                    tsInterface.properties.push(this.convertProperty(property));
                }
            }
            return tsInterface;
        }
        else {
            return new ts.Typedef(type.id, this.convertTypeRef(type), type.description);
        }
    }
    
    public convertProperty(property: wp.TypeProperty): ts.Property {
        return new ts.Property(property.name, this.convertTypeRef(property), property.optional, property.description);
    }
    
    public convertTypeRef(typeRef: wp.TypeRef): string {
        if (typeRef.type) {
            switch(typeRef.type) {
                case 'integer': return 'number';
                case 'array': return this.convertTypeRef(typeRef.items) + '[]';
                case 'object': return 'any';
            }
            return typeRef.type;
        }
        else {
            var ref = typeRef['$ref'];
            return ref;
        }
    }
    
    private convertCommand(command: wp.Command, typesStorrage: ts.Type[], paramsTypeSuffix: string = "Params", resultTypeSuffix: string = "Result"): ts.Method {
        let method: ts.Method = new ts.Method(command.name, "any", command.description);
        let uppercasedMethodName = method.name.charAt(0).toUpperCase() + method.name.slice(1);

        // Resolve return type
        if (command.returns) {
            let returnedTypeDefinition: wp.TypeDefinition = { 
                id: `${uppercasedMethodName}${resultTypeSuffix}`,
                type: 'object',
                description: `The result from ${command.name} method`,
                properties: command.returns
            };
            let returnType = this.convertType(returnedTypeDefinition);
            typesStorrage.push(returnType);
            method.returnType = this.convertTypeRef({ '$ref': returnType.name });
        }

        // Resolve parameters
        if (command.parameters && command.parameters.length > 0) {
            let paramsTypeDefinition: wp.TypeDefinition = {
                id: `${uppercasedMethodName}${paramsTypeSuffix}`,
                type: 'object',
                description: `Parameters passed to the '${command.name}' method`,
                properties: command.parameters 
            };
            let paramsType = this.convertType(paramsTypeDefinition);
            typesStorrage.push(paramsType);
            method.parameters.push(new ts.MethodParameter('args', paramsType.name, false, ''));
        }

        return method;
    }
    
    public convertEvent(event: wp.Event, typesStorrage: ts.Type[]): ts.Method {
        let method: ts.Method = this.convertCommand(event, typesStorrage, "EventArgs");
        let uppercasedMethodName = method.name.charAt(0).toUpperCase() + method.name.slice(1);
        method.name = `on${uppercasedMethodName}`;
        return method;
    }
}