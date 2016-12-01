import * as ts from './TypeScriptAst';
import * as wp from './WebkitProtocolDescription';

export class AstGenerator {
    
    public convertDomain(domain: wp.Domain): ts.Namespace {
        let namespace: ts.Namespace = new ts.Namespace(domain.domain, false, domain.description);
        
        if (domain.types) {
            for (let type of domain.types) {
                let tsType: ts.Interface | ts.Typedef = this.convertType(type);
                if (tsType instanceof ts.Interface) {
                    namespace.interfaces.push(<ts.Interface>tsType);
                }
                else {
                    namespace.typedefs.push(<ts.Typedef>tsType);
                }
            }
        }
        
        let commandsNamespace: ts.Namespace = new ts.Namespace('Commands', false, `All commands belonging to the ${namespace.name} domain.`);
        namespace.namespaces.push(commandsNamespace);
        if (domain.commands) {
            for (let command of domain.commands) {
                let result = this.convertCommand(command);
                if (result.args) {
                    namespace.interfaces.push(result.args);
                }
                if (result.returns) {
                    namespace.interfaces.push(result.returns);
                }
                commandsNamespace.interfaces.push(result.func);
            }
        }
        
        let eventsNamespace: ts.Namespace = new ts.Namespace('Events', false, `All events belonging to the ${namespace.name} domain.`);
        namespace.namespaces.push(eventsNamespace);
        if (domain.events) {
            for(let event of domain.events) {
                let result = this.convertEvent(event);
                if (result.args) {
                    namespace.interfaces.push(result.args);
                }
                if (result.returns) {
                    namespace.interfaces.push(result.returns);
                }
                eventsNamespace.interfaces.push(result.func);
            }
        }
        
        return namespace;
    }
    
    public convertType(type: wp.TypeDefinition): ts.Interface | ts.Typedef {
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
    
    private convertCommand(command: wp.Command): { func: ts.Interface, returns: ts.Interface, args: ts.Interface } {
        return this.convertCommandOrEvent(command, true);
    }
    
    public convertEvent(event: wp.Event): { func: ts.Interface, returns: ts.Interface, args: ts.Interface } {
        return this.convertCommandOrEvent(event, false);
    }
    
    private convertCommandOrEvent(command: wp.Command, isCommand: boolean): { func: ts.Interface, returns: ts.Interface, args: ts.Interface } {
        
        let commandName = command.name.charAt(0).toUpperCase() + command.name.slice(1);
        let resultName = commandName + 'Result';
        let result: { func: ts.Interface, returns: ts.Interface, args: ts.Interface } = { func: null, returns: null, args: null };
        
        if (command.returns) {
            let returnedType: wp.TypeDefinition = { id: resultName, type: 'object', description: `The returned object from ${command.name} command`, properties: command.returns };
            result.returns = <ts.Interface>this.convertType(returnedType);
        }
        
        let funcType: wp.TypeDefinition = { id: command.name, type: 'object', description: command.description, properties: [] };
        result.func = <ts.Interface>this.convertType(funcType);
        let callSignReturnType: string = result.returns ? this.convertTypeRef({ '$ref': result.returns.name }) : 'any';
        result.func.callSignature = new ts.CallSignature(callSignReturnType, '');
        if (command.parameters) {
            // If it is command - list all parameters in the function signature.
            // In case of event - wrap all parameters in EventArgs interface. 
            if (isCommand) {
                for (let i = 0; i < command.parameters.length; i++) {
                    let param: wp.TypeProperty = command.parameters[i];
                    result.func.callSignature.parameters.push(new ts.FunctionParameter(param.name, this.convertTypeRef(param), param.optional, param.description ));
                }
            }
            else {
                let paramType: wp.TypeDefinition = { id: `${commandName}EventArgs`, type: 'object', description: `Arguments passed to the '${command.name}' event.`, properties: command.parameters };
                result.args = <ts.Interface>this.convertType(paramType);
                result.func.callSignature.parameters.push(new ts.FunctionParameter('params', paramType.id, false, ''));
            }
        }
        
        return result;
    }
}