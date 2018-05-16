/*************************************************************
 *
 *  Copyright (c) 2018 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


/**
 * @fileoverview Configuration options for the TexParser.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import {ParseMethod} from './Types.js';
import {HandlerType} from './MapHandler.js';
import {StackItemClass} from './StackItem.js';
import {TagsClass} from './Tags.js';


export type HandlerConfig = {[P in HandlerType]?: string[]}
export type FallbackConfig = {[P in HandlerType]?: ParseMethod}
export type StackItemConfig = {[kind: string]: StackItemClass}
export type TagsConfig = {[kind: string]: TagsClass}
export type OptionsConfig = {[key: string]: (string|boolean)}


export class Configuration {

  // Configuration for the TexParser consist of the following:
  // * Handlerconfigurations
  // * Fallback methods for handler types.
  // * StackItem mappings for the StackFactory.
  // * Tagging objects.
  // * Other Options.

  /**
   * @constructor
   */
  constructor(readonly name: string,
              readonly handler: HandlerConfig = {},
              readonly fallback: FallbackConfig = {},
              readonly items: StackItemConfig = {},
              readonly tags: TagsConfig = {},
              readonly options: OptionsConfig = {}
             ) {
    let _default: HandlerConfig = {character: [], delimiter: [], macro: [], environment: []};
    let handlers = Object.keys(handler) as HandlerType[];
    for (const key of handlers) {
      _default[key] = handler[key];
    }
    this.handler = _default;
    ConfigurationHandler.getInstance().set(name, this);
  }


  /**
   * Appends configurations to this configuration. Note that fallbacks are
   * overwritten.
   *
   * @param {Configuration} configuration A configuration setting for the TeX
   *       parser.
   */
  public append(config: Configuration): void {
    let handlers = Object.keys(config.handler) as HandlerType[];
    for (const key of handlers) {
      for (const map of config.handler[key]) {
        this.handler[key].unshift(map);
      }
    }
    handlers = Object.keys(config.fallback) as HandlerType[];
    for (const key of handlers) {
      let name = key as HandlerType;
      this.fallback[name] = config.fallback[name];
    }
    for (const name of Object.keys(config.items)) {
      this.items[name] = config.items[name];
    }
    for (const name of Object.keys(config.tags)) {
      this.tags[name] = config.tags[name];
    }
    for (const name of Object.keys(config.options)) {
      this.options[name] = config.options[name];
    }
  }

};


export class ConfigurationHandler {

  private static instance: ConfigurationHandler;

  private map: Map<string, Configuration> = new Map();

  /**
   * @return {ConfigurationHandler} The singleton ConfigurationHandler object.
   */
  public static getInstance(): ConfigurationHandler {
    if (!ConfigurationHandler.instance) {
      ConfigurationHandler.instance = new ConfigurationHandler();
    }
    return ConfigurationHandler.instance;
  }


  /**
   * Adds a new configuration to the handler overwriting old ones.
   *
   * @param {SymbolConfiguration} map Registers a new symbol map.
   */
  public set(name: string, map: Configuration): void {
    this.map.set(name, map);
  }

    
  /**
   * Looks up a configuration.
   *
   * @param {string} name The name of the configuration.
   * @return {SymbolConfiguration} The configuration with the given name or null.
   */
  public get(name: string): Configuration {
    return this.map.get(name);
  }

  /**
   * @return {string[]} All configurations in the handler.
   */
  public keys(): IterableIterator<string> {
    return this.map.keys();
  }


  /**
   * Dummy constructor
   * @constructor
   */
  private constructor() { }

}

