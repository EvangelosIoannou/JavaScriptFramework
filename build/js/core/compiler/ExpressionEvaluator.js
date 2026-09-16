export function evaluateExpression(
    ast,
    component,
    scope = null
) {

    if (!ast) {
        return undefined;
    }

    return evaluateNode(
        ast,
        component,
        scope
    );
}


/**
 * Evaluate one expression AST node.
 */
function evaluateNode(
    node,
    component,
    scope
) {

    switch (node.type) {

        case "literal":
            return node.value;

        case "identifier":
            return resolveIdentifier(
                node.name,
                component,
                scope
            );

        case "member":
            return evaluateMember(
                node,
                component,
                scope
            );

        case "computed-member":
            return evaluateComputedMember(
                node,
                component,
                scope
            );

        case "call":
            return evaluateCall(
                node,
                component,
                scope
            );

        case "unary":
            return evaluateUnary(
                node,
                component,
                scope
            );

        case "binary":
            return evaluateBinary(
                node,
                component,
                scope
            );

        case "logical":
            return evaluateLogical(
                node,
                component,
                scope
            );

        case "conditional":
            return evaluateConditional(
                node,
                component,
                scope
            );

        default:
            throw new Error(
                `Unknown expression node type '${node.type}'`
            );
    }
}


/**
 * Resolve an identifier.
 */
function resolveIdentifier(
    name,
    component,
    scope
) {

    /*
     * Local scope has the highest priority.
     *
     * This is what allows:
     *
     *     {{ user.name }}
     *
     * inside:
     *
     *     for="user in users"
     */
    if (scope instanceof Map) {

        if (scope.has(name)) {

            return readReactiveValue(
                scope.get(name)
            );
        }
    }

    /*
     * Safe globals.
     */
    switch (name) {

        case "Math":
            return Math;

        case "Number":
            return Number;

        case "String":
            return String;

        case "Boolean":
            return Boolean;

        case "Date":
            return Date;

        case "Array":
            return Array;

        case "Object":
            return Object;
    }

    /*
     * Component instance properties.
     */
    if (
        component &&
        name in component
    ) {

        return readReactiveValue(
            component[name]
        );
    }

    /*
     * Component props.
     */
    if (
        component?.props &&
        name in component.props
    ) {

        return readReactiveValue(
            component.props[name]
        );
    }

    return undefined;
}


/**
 * Read a reactive value.
 *
 * Anything exposing get() is treated as a reactive source.
 */
function readReactiveValue(value) {

    if (
        value &&
        typeof value.get === "function"
    ) {

        return value.get();
    }

    return value;
}


/**
 * Resolve:
 *
 *     object.property
 */
function evaluateMember(
    node,
    component,
    scope
) {

    const object = evaluateNode(
        node.object,
        component,
        scope
    );

    if (
        object === null ||
        object === undefined
    ) {
        return undefined;
    }

    return object[node.property];
}


/**
 * Resolve:
 *
 *     object[expression]
 */
function evaluateComputedMember(
    node,
    component,
    scope
) {

    const object = evaluateNode(
        node.object,
        component,
        scope
    );

    if (
        object === null ||
        object === undefined
    ) {
        return undefined;
    }

    const property = evaluateNode(
        node.property,
        component,
        scope
    );

    return object[property];
}


/**
 * Evaluate a function call.
 */
function evaluateCall(
    node,
    component,
    scope
) {

    let thisArg = null;
    let fn;

    /*
     * Preserve the object when calling:
     *
     *     user.getName()
     *
     * rather than losing `this`.
     */
    if (
        node.callee?.type === "member" ||
        node.callee?.type === "computed-member"
    ) {

        thisArg = evaluateNode(
            node.callee.object,
            component,
            scope
        );

        if (
            thisArg === null ||
            thisArg === undefined
        ) {
            return undefined;
        }

        if (
            node.callee.type === "member"
        ) {

            fn =
                thisArg[
                    node.callee.property
                ];

        } else {

            const property =
                evaluateNode(
                    node.callee.property,
                    component,
                    scope
                );

            fn =
                thisArg[property];
        }

    } else {

        fn = evaluateNode(
            node.callee,
            component,
            scope
        );
    }

    if (typeof fn !== "function") {
        return undefined;
    }

    const args =
        node.arguments.map(
            argument =>
                evaluateNode(
                    argument,
                    component,
                    scope
                )
        );

    return fn.apply(
        thisArg,
        args
    );
}


/**
 * Unary operators.
 */
function evaluateUnary(
    node,
    component,
    scope
) {

    const value =
        evaluateNode(
            node.argument,
            component,
            scope
        );

    switch (node.operator) {

        case "!":
            return !value;

        case "-":
            return -value;

        case "+":
            return +value;

        default:
            throw new Error(
                `Unsupported unary operator '${node.operator}'`
            );
    }
}


/**
 * Binary operators.
 */
function evaluateBinary(
    node,
    component,
    scope
) {

    const left =
        evaluateNode(
            node.left,
            component,
            scope
        );

    const right =
        evaluateNode(
            node.right,
            component,
            scope
        );

    switch (node.operator) {

        case "+":
            return left + right;

        case "-":
            return left - right;

        case "*":
            return left * right;

        case "/":
            return left / right;

        case "%":
            return left % right;

        case ">":
            return left > right;

        case "<":
            return left < right;

        case ">=":
            return left >= right;

        case "<=":
            return left <= right;

        case "==":
            return left == right;

        case "!=":
            return left != right;

        case "===":
            return left === right;

        case "!==":
            return left !== right;

        default:
            throw new Error(
                `Unsupported binary operator '${node.operator}'`
            );
    }
}


/**
 * Logical operators.
 *
 * These deliberately short-circuit.
 */
function evaluateLogical(
    node,
    component,
    scope
) {

    const left =
        evaluateNode(
            node.left,
            component,
            scope
        );

    if (node.operator === "&&") {

        return left
            ? evaluateNode(
                node.right,
                component,
                scope
            )
            : left;
    }

    if (node.operator === "||") {

        return left
            ? left
            : evaluateNode(
                node.right,
                component,
                scope
            );
    }

    if (node.operator === "??") {

        return left ??
            evaluateNode(
                node.right,
                component,
                scope
            );
    }

    throw new Error(
        `Unsupported logical operator '${node.operator}'`
    );
}


/**
 * Conditional operator:
 *
 *     condition ? yes : no
 */
function evaluateConditional(
    node,
    component,
    scope
) {

    const condition =
        evaluateNode(
            node.test,
            component,
            scope
        );

    return condition
        ? evaluateNode(
            node.consequent,
            component,
            scope
        )
        : evaluateNode(
            node.alternate,
            component,
            scope
        );
}