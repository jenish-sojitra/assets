/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable @exodus/mutable/no-param-reassign-prop-only */
// src/storages/globalConfig/globalConfig.ts

// @__NO_SIDE_EFFECTS__
function getGlobalConfig(cfg) {
  // NOTE: exodus dev edited on audit
  return {
    lang: cfg?.lang,
    message: cfg?.message,
    abortEarly: !!cfg?.abortEarly,
    abortPipeEarly: !!cfg?.abortPipeEarly,
  }
}

// @__NO_SIDE_EFFECTS__
function getGlobalMessage(lang) {
  // NOTE: exodus dev edited on audit
}

// @__NO_SIDE_EFFECTS__
function getSchemaMessage(lang) {
  // NOTE: exodus dev edited on audit
}

// @__NO_SIDE_EFFECTS__
function getSpecificMessage(reference, lang) {
  // NOTE: exodus dev edited on audit
}

// src/utils/_stringify/_stringify.ts
// @__NO_SIDE_EFFECTS__
function _stringify(input) {
  const type = typeof input
  if (type === 'string') {
    return `"${input}"`
  }

  if (type === 'number' || type === 'bigint' || type === 'boolean') {
    return `${input}`
  }

  if (type === 'object' || type === 'function') {
    return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? 'null'
  }

  return type
}

// src/utils/_addIssue/_addIssue.ts
function _addIssue(context, label, dataset, config2, other) {
  const input = other && 'input' in other ? other.input : dataset.value
  const expected = other?.expected ?? context.expects ?? null
  const received = other?.received ?? _stringify(input)
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : 'R'}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config2.lang,
    abortEarly: config2.abortEarly,
    abortPipeEarly: config2.abortPipeEarly,
  }
  const isSchema = context.kind === 'schema'
  const message2 =
    other?.message ??
    context.message ??
    getSpecificMessage(context.reference, issue.lang) ??
    (isSchema ? getSchemaMessage(issue.lang) : null) ??
    config2.message ??
    getGlobalMessage(issue.lang)
  if (message2 !== void 0) {
    issue.message =
      typeof message2 === 'function'
        ? // @ts-expect-error
          message2(issue)
        : message2
  }

  if (isSchema) {
    dataset.typed = false
  }

  if (dataset.issues) {
    dataset.issues.push(issue)
  } else {
    dataset.issues = [issue]
  }
}

// src/utils/_getStandardProps/_getStandardProps.ts
// @__NO_SIDE_EFFECTS__
function _getStandardProps(context) {
  return {
    version: 1,
    vendor: 'valibot',
    validate(value2) {
      return context['~run']({ value: value2 }, getGlobalConfig())
    },
  }
}

// src/utils/_isValidObjectKey/_isValidObjectKey.ts
// @__NO_SIDE_EFFECTS__
function _isValidObjectKey(object2, key) {
  return (
    Object.hasOwn(object2, key) &&
    key !== '__proto__' &&
    key !== 'prototype' &&
    key !== 'constructor'
  )
}

// src/utils/_joinExpects/_joinExpects.ts
// @__NO_SIDE_EFFECTS__
function _joinExpects(values2, separator) {
  const list = [...new Set(values2)]
  if (list.length > 1) {
    return `(${list.join(` ${separator} `)})`
  }

  return list[0] ?? 'never'
}

// src/utils/ValiError/ValiError.ts
var ValiError = class extends Error {
  /**
   * Creates a Valibot error with useful information.
   *
   * @param issues The error issues.
   */
  constructor(issues) {
    super(issues[0].message)
    this.name = 'ValiError'
    this.issues = issues
  }
}

// src/actions/check/check.ts
// @__NO_SIDE_EFFECTS__
function check(requirement, message2) {
  return {
    kind: 'validation',
    type: 'check',
    reference: check,
    async: false,
    expects: null,
    requirement,
    message: message2,
    '~run'(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'input', dataset, config2)
      }

      return dataset
    },
  }
}

// src/actions/integer/integer.ts
// @__NO_SIDE_EFFECTS__
function integer(message2) {
  return {
    kind: 'validation',
    type: 'integer',
    reference: integer,
    async: false,
    expects: null,
    requirement: Number.isInteger,
    message: message2,
    '~run'(dataset, config2) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'integer', dataset, config2)
      }

      return dataset
    },
  }
}

// src/actions/transform/transform.ts
// @__NO_SIDE_EFFECTS__
function transform(operation) {
  return {
    kind: 'transformation',
    type: 'transform',
    reference: transform,
    async: false,
    operation,
    '~run'(dataset) {
      dataset.value = this.operation(dataset.value)
      return dataset
    },
  }
}

// src/methods/getFallback/getFallback.ts
// @__NO_SIDE_EFFECTS__
function getFallback(schema, dataset, config2) {
  return typeof schema.fallback === 'function'
    ? // @ts-expect-error
      schema.fallback(dataset, config2)
    : // @ts-expect-error
      schema.fallback
}

// src/methods/getDefault/getDefault.ts
// @__NO_SIDE_EFFECTS__
function getDefault(schema, dataset, config2) {
  return typeof schema.default === 'function'
    ? // @ts-expect-error
      schema.default(dataset, config2)
    : // @ts-expect-error
      schema.default
}

// src/methods/is/is.ts
// @__NO_SIDE_EFFECTS__
function is(schema, input) {
  return !schema['~run']({ value: input }, { abortEarly: true }).issues
}

// src/schemas/array/array.ts
// @__NO_SIDE_EFFECTS__
function array(item, message2) {
  return {
    kind: 'schema',
    type: 'array',
    reference: array,
    expects: 'Array',
    async: false,
    item,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      const input = dataset.value
      if (Array.isArray(input)) {
        dataset.typed = true
        dataset.value = []
        for (let key = 0; key < input.length; key++) {
          const value2 = input[key]
          const itemDataset = this.item['~run']({ value: value2 }, config2)
          if (itemDataset.issues) {
            const pathItem = {
              type: 'array',
              origin: 'value',
              input,
              key,
              value: value2,
            }
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem)
              } else {
                issue.path = [pathItem]
              }

              dataset.issues?.push(issue)
            }

            if (!dataset.issues) {
              dataset.issues = itemDataset.issues
            }

            if (config2.abortEarly) {
              dataset.typed = false
              break
            }
          }

          if (!itemDataset.typed) {
            dataset.typed = false
          }

          dataset.value.push(itemDataset.value)
        }
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/bigint/bigint.ts
// @__NO_SIDE_EFFECTS__
function bigint(message2) {
  return {
    kind: 'schema',
    type: 'bigint',
    reference: bigint,
    expects: 'bigint',
    async: false,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (typeof dataset.value === 'bigint') {
        dataset.typed = true
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/boolean/boolean.ts
// @__NO_SIDE_EFFECTS__
function boolean(message2) {
  return {
    kind: 'schema',
    type: 'boolean',
    reference: boolean,
    expects: 'boolean',
    async: false,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (typeof dataset.value === 'boolean') {
        dataset.typed = true
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/lazy/lazy.ts
// @__NO_SIDE_EFFECTS__
function lazy(getter) {
  return {
    kind: 'schema',
    type: 'lazy',
    reference: lazy,
    expects: 'unknown',
    async: false,
    getter,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      return this.getter(dataset.value)['~run'](dataset, config2)
    },
  }
}

// src/schemas/literal/literal.ts
// @__NO_SIDE_EFFECTS__
function literal(literal_, message2) {
  return {
    kind: 'schema',
    type: 'literal',
    reference: literal,
    expects: _stringify(literal_),
    async: false,
    literal: literal_,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (dataset.value === this.literal) {
        dataset.typed = true
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/nullable/nullable.ts
// @__NO_SIDE_EFFECTS__
function nullable(wrapped, default_) {
  return {
    kind: 'schema',
    type: 'nullable',
    reference: nullable,
    expects: `(${wrapped.expects} | null)`,
    async: false,
    wrapped,
    default: default_,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (dataset.value === null) {
        if (this.default !== void 0) {
          dataset.value = getDefault(this, dataset, config2)
        }

        if (dataset.value === null) {
          dataset.typed = true
          return dataset
        }
      }

      return this.wrapped['~run'](dataset, config2)
    },
  }
}

// src/schemas/nullish/nullish.ts
// @__NO_SIDE_EFFECTS__
function nullish(wrapped, default_) {
  return {
    kind: 'schema',
    type: 'nullish',
    reference: nullish,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (dataset.value === null || dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = getDefault(this, dataset, config2)
        }

        if (dataset.value === null || dataset.value === void 0) {
          dataset.typed = true
          return dataset
        }
      }

      return this.wrapped['~run'](dataset, config2)
    },
  }
}

// src/schemas/number/number.ts
// @__NO_SIDE_EFFECTS__
function number(message2) {
  return {
    kind: 'schema',
    type: 'number',
    reference: number,
    expects: 'number',
    async: false,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (typeof dataset.value === 'number' && !isNaN(dataset.value)) {
        dataset.typed = true
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/object/object.ts
// @__NO_SIDE_EFFECTS__
function object(entries2, message2) {
  return {
    kind: 'schema',
    type: 'object',
    reference: object,
    expects: 'Object',
    async: false,
    entries: entries2,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      const input = dataset.value
      if (input && typeof input === 'object') {
        dataset.typed = true
        dataset.value = Object.create(null)
        for (const key in this.entries) {
          const valueSchema = this.entries[key]
          if (
            key in input ||
            ((valueSchema.type === 'exact_optional' ||
              valueSchema.type === 'optional' ||
              valueSchema.type === 'nullish') && // @ts-expect-error
              valueSchema.default !== void 0)
          ) {
            const value2 =
              key in input
                ? // @ts-expect-error
                  input[key]
                : getDefault(valueSchema)
            const valueDataset = valueSchema['~run']({ value: value2 }, config2)
            if (valueDataset.issues) {
              const pathItem = {
                type: 'object',
                origin: 'value',
                input,
                key,
                value: value2,
              }
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem)
                } else {
                  issue.path = [pathItem]
                }

                dataset.issues?.push(issue)
              }

              if (!dataset.issues) {
                dataset.issues = valueDataset.issues
              }

              if (config2.abortEarly) {
                dataset.typed = false
                break
              }
            }

            if (!valueDataset.typed) {
              dataset.typed = false
            }

            dataset.value[key] = valueDataset.value
          } else if (valueSchema.fallback !== void 0) {
            dataset.value[key] = getFallback(valueSchema)
          } else if (
            valueSchema.type !== 'exact_optional' &&
            valueSchema.type !== 'optional' &&
            valueSchema.type !== 'nullish'
          ) {
            _addIssue(this, 'key', dataset, config2, {
              input: void 0,
              expected: `"${key}"`,
              path: [
                {
                  type: 'object',
                  origin: 'key',
                  input,
                  key,
                  // @ts-expect-error
                  value: input[key],
                },
              ],
            })
            if (config2.abortEarly) {
              break
            }
          }
        }
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/optional/optional.ts
// @__NO_SIDE_EFFECTS__
function optional(wrapped, default_) {
  return {
    kind: 'schema',
    type: 'optional',
    reference: optional,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) {
          dataset.value = getDefault(this, dataset, config2)
        }

        if (dataset.value === void 0) {
          dataset.typed = true
          return dataset
        }
      }

      return this.wrapped['~run'](dataset, config2)
    },
  }
}

// src/schemas/record/record.ts
// @__NO_SIDE_EFFECTS__
function record(key, value2, message2) {
  return {
    kind: 'schema',
    type: 'record',
    reference: record,
    expects: 'Object',
    async: false,
    key,
    value: value2,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      const input = dataset.value
      if (input && typeof input === 'object') {
        dataset.typed = true
        dataset.value = Object.create(null)
        for (const entryKey in input) {
          if (_isValidObjectKey(input, entryKey)) {
            const entryValue = input[entryKey]
            const keyDataset = this.key['~run']({ value: entryKey }, config2)
            if (keyDataset.issues) {
              const pathItem = {
                type: 'object',
                origin: 'key',
                input,
                key: entryKey,
                value: entryValue,
              }
              for (const issue of keyDataset.issues) {
                issue.path = [pathItem]
                dataset.issues?.push(issue)
              }

              if (!dataset.issues) {
                dataset.issues = keyDataset.issues
              }

              if (config2.abortEarly) {
                dataset.typed = false
                break
              }
            }

            const valueDataset = this.value['~run']({ value: entryValue }, config2)
            if (valueDataset.issues) {
              const pathItem = {
                type: 'object',
                origin: 'value',
                input,
                key: entryKey,
                value: entryValue,
              }
              for (const issue of valueDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem)
                } else {
                  issue.path = [pathItem]
                }

                dataset.issues?.push(issue)
              }

              if (!dataset.issues) {
                dataset.issues = valueDataset.issues
              }

              if (config2.abortEarly) {
                dataset.typed = false
                break
              }
            }

            if (!keyDataset.typed || !valueDataset.typed) {
              dataset.typed = false
            }

            if (keyDataset.typed) {
              dataset.value[keyDataset.value] = valueDataset.value
            }
          }
        }
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/string/string.ts
// @__NO_SIDE_EFFECTS__
function string(message2) {
  return {
    kind: 'schema',
    type: 'string',
    reference: string,
    expects: 'string',
    async: false,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      if (typeof dataset.value === 'string') {
        dataset.typed = true
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/tuple/tuple.ts
// @__NO_SIDE_EFFECTS__
function tuple(items, message2) {
  return {
    kind: 'schema',
    type: 'tuple',
    reference: tuple,
    expects: 'Array',
    async: false,
    items,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      const input = dataset.value
      if (Array.isArray(input)) {
        dataset.typed = true
        dataset.value = []
        for (let key = 0; key < this.items.length; key++) {
          const value2 = input[key]
          const itemDataset = this.items[key]['~run']({ value: value2 }, config2)
          if (itemDataset.issues) {
            const pathItem = {
              type: 'array',
              origin: 'value',
              input,
              key,
              value: value2,
            }
            for (const issue of itemDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem)
              } else {
                issue.path = [pathItem]
              }

              dataset.issues?.push(issue)
            }

            if (!dataset.issues) {
              dataset.issues = itemDataset.issues
            }

            if (config2.abortEarly) {
              dataset.typed = false
              break
            }
          }

          if (!itemDataset.typed) {
            dataset.typed = false
          }

          dataset.value.push(itemDataset.value)
        }
      } else {
        _addIssue(this, 'type', dataset, config2)
      }

      return dataset
    },
  }
}

// src/schemas/union/utils/_subIssues/_subIssues.ts
// @__NO_SIDE_EFFECTS__
function _subIssues(datasets) {
  let issues
  if (datasets) {
    for (const dataset of datasets) {
      if (issues) {
        issues.push(...dataset.issues)
      } else {
        issues = dataset.issues
      }
    }
  }

  return issues
}

// src/schemas/union/union.ts
// @__NO_SIDE_EFFECTS__
function union(options, message2) {
  return {
    kind: 'schema',
    type: 'union',
    reference: union,
    expects: _joinExpects(
      options.map((option) => option.expects),
      '|'
    ),
    async: false,
    options,
    message: message2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      let validDataset
      let typedDatasets
      let untypedDatasets
      for (const schema of this.options) {
        const optionDataset = schema['~run']({ value: dataset.value }, config2)
        if (optionDataset.typed) {
          if (optionDataset.issues) {
            if (typedDatasets) {
              typedDatasets.push(optionDataset)
            } else {
              typedDatasets = [optionDataset]
            }
          } else {
            validDataset = optionDataset
            break
          }
        } else {
          if (untypedDatasets) {
            untypedDatasets.push(optionDataset)
          } else {
            untypedDatasets = [optionDataset]
          }
        }
      }

      if (validDataset) {
        return validDataset
      }

      if (typedDatasets) {
        if (typedDatasets.length === 1) {
          return typedDatasets[0]
        }

        _addIssue(this, 'type', dataset, config2, {
          issues: _subIssues(typedDatasets),
        })
        dataset.typed = true
      } else if (untypedDatasets?.length === 1) {
        return untypedDatasets[0]
      } else {
        _addIssue(this, 'type', dataset, config2, {
          issues: _subIssues(untypedDatasets),
        })
      }

      return dataset
    },
  }
}

// src/schemas/unknown/unknown.ts
// @__NO_SIDE_EFFECTS__
function unknown() {
  return {
    kind: 'schema',
    type: 'unknown',
    reference: unknown,
    expects: 'unknown',
    async: false,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset) {
      dataset.typed = true
      return dataset
    },
  }
}

// src/methods/parse/parse.ts
function parse(schema, input, config2) {
  const dataset = schema['~run']({ value: input }, getGlobalConfig(config2))
  if (dataset.issues) {
    throw new ValiError(dataset.issues)
  }

  return dataset.value
}

// src/methods/pipe/pipe.ts
// @__NO_SIDE_EFFECTS__
function pipe(...pipe2) {
  return {
    ...pipe2[0],
    pipe: pipe2,
    get '~standard'() {
      return _getStandardProps(this)
    },
    '~run'(dataset, config2) {
      for (const item of pipe2) {
        if (item.kind !== 'metadata') {
          if (dataset.issues && (item.kind === 'schema' || item.kind === 'transformation')) {
            dataset.typed = false
            break
          }

          if (!dataset.issues || (!config2.abortEarly && !config2.abortPipeEarly)) {
            dataset = item['~run'](dataset, config2)
          }
        }
      }

      return dataset
    },
  }
}

export {
  array,
  bigint,
  boolean,
  check,
  integer,
  is,
  lazy,
  literal,
  nullable,
  nullish,
  number,
  object,
  optional,
  parse,
  pipe,
  record,
  string,
  transform,
  tuple,
  union,
  unknown,
}
