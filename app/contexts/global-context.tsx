/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use client'

import React, { type PropsWithChildren, createContext, useState } from 'react'

/**
 * Mang email tu man /sign-in sang /code-confirmation. Cac truong cu
 * (session/firstName/lastName/username) da bo: `session` la kieu cua Supabase
 * - da doi sang D1 + KV tu lau, ba truong con lai khong noi nao doc.
 */
interface Context {
  email?: string
  updateState: (newValues: Partial<Context>) => void
}

export const GlobalContext = createContext<Context>({
  updateState: () => {}
})

export function GlobalContextProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState({})

  const updateState = (newValues: Partial<Context>) => {
    setState(prevState => ({ ...prevState, ...newValues }))
  }

  return (
    <GlobalContext.Provider value={{ ...state, updateState }}>
      {children}
    </GlobalContext.Provider>
  )
}
