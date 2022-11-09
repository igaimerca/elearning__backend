import { GraphQLError, GraphQLFormattedError } from 'graphql';

export function formatErrors(error: GraphQLError) {
  if (error.message === 'VALIDATION_ERROR') {
    const extensions = {
      code: 'VALIDATION_ERROR',
      errors: [],
    };

    Object.keys(error.extensions.invalidArgs).forEach((key) => {
      const constraints = [];
      Object.keys(error.extensions.invalidArgs[key].constraints).forEach(
        (_key) => {
          constraints.push(error.extensions.invalidArgs[key].constraints[_key]);
        },
      );

      extensions.errors.push({
        field: error.extensions.invalidArgs[key].property,
        errors: constraints,
      });
    });

    const graphQLFormattedError: GraphQLFormattedError = {
      message: 'VALIDATION_ERROR',
      extensions: extensions,
    };

    return graphQLFormattedError;
  } else if (error.extensions.code === 'UNAUTHENTICATED') {
    return {
      status: 400,
      message: 'Not authenticated',
      error: 'Unauthenticated',
    };
  } else if (error.extensions.code === 'USER_NOT_FOUND') {
    return {
      status: 400,
      message: 'User not found, Data form token fails in data store',
      error: 'Unauthenticated',
    };
  } else if (!error.path) {
    return {
      message: error.message,
      status: 400,
    };
  } else {
    console.log(error);
    return {
      message: 'Something went wrong!',
      status: 400,
    };
  }
}
