import React from 'react'

import _ from 'lodash'

import {type Props as EditorProps} from './content.tsx'

import {rupiah} from '~/utils/currency.ts'

import {ButtonHide, Title} from './right-sheet.tsx'
import {Skeleton} from '~/components/ui/skeleton.tsx'
import {Button} from '~/components/ui/button.tsx'
import {Separator} from '~/components/ui/separator.tsx'

type Props = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  groupedTaskItems: any
  incomesValues: number[]
  expensesValues: number[]
} & Pick<EditorProps, 'editor'>

function Sum({
  isOpen,
  setIsOpen,
  editor,
  groupedTaskItems,
  incomesValues,
  expensesValues,
}: Props) {
  return (
    <>
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:w-0 data-[state=open]:w-[340px] data-[state=closed]:duration-300 data-[state=open]:duration-500"
      ></div>
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className="data-[state=open]:animate-in data-[state=closed]:animate-out fixed right-0 h-screen bg-white transition-all ease-in-out data-[state=closed]:w-0 data-[state=open]:w-[340px] data-[state=closed]:duration-300 data-[state=open]:duration-500 dark:bg-zinc-900"
      >
        <div className="sticky top-20 flex w-[340px] flex-col gap-8 px-6">
          <ButtonHide setIsOpen={setIsOpen} />
          <Title
            title="Perhitungan"
            tooltipDesc="Perhitungan akan bereaksi terhadap perubahan catatan keuangan bulanan"
            desc="Selalu pastikan pengeluaran tidak melampaui pemasukan Anda"
          />
          <Summary
            editor={editor}
            incomesValues={incomesValues}
            expensesValues={expensesValues}
          />
          <Separator className="my-2" />
          <Title
            title="Detail"
            tooltipDesc="Selalu pastikan heading transaksi konsisten"
            desc="Secara lengkap transaksi anda terorganisir disini"
          />
          <Detail groupedTaskItems={groupedTaskItems} />
        </div>
      </div>
    </>
  )
}

function Summary({
  editor,
  incomesValues,
  expensesValues,
}: Pick<Props, 'editor' | 'incomesValues' | 'expensesValues'>) {
  const totalIncome = _.sum(incomesValues)
  const totalExpense = _.sum(expensesValues)
  const freeCash = totalIncome - totalExpense

  return (
    <div className="flex flex-col gap-5">
      <Income amount={totalIncome} isPending={!editor} />
      <Expense amount={totalExpense} isPending={!editor} />
      <FreeCash amount={freeCash} isPending={!editor} />
    </div>
  )
}

function Detail({groupedTaskItems}: {groupedTaskItems: any}) {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <div className="relative">
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className="flex flex-col gap-3 overflow-hidden data-[state=closed]:h-[170px] data-[state=open]:h-full"
      >
        {groupedTaskItems.map(
          (item: {
            title: string
            incomeTotal: number
            expenseTotal: number
          }) => (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm">{item.title}</h4>
              <div>
                <h5 className="text-muted-foreground flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-green-300"></div>
                  {typeof item.incomeTotal === 'number'
                    ? rupiah(item.incomeTotal)
                    : 'tunggu..'}
                </h5>
                <h5 className="text-muted-foreground flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full bg-red-300"></div>
                  {typeof item.expenseTotal === 'number'
                    ? rupiah(item.expenseTotal)
                    : 'tunggu..'}
                </h5>
              </div>
            </div>
          ),
        )}
      </div>
      {!isOpen && (
        <div className="text absolute bottom-0 left-0 -mt-1 h-full w-full bg-gradient-to-t from-white to-white/30 dark:from-zinc-900 dark:to-zinc-900/20"></div>
      )}
      <div className="sticky bottom-0 mt-4 flex w-full justify-center">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
          className="text-muted-foreground !h-6 w-fit px-2"
          variant="ghost"
        >
          {!isOpen ? 'Selengkapnya' : 'Tutup'}
        </Button>
      </div>
    </div>
  )
}

function Income({amount, isPending}: {amount: number; isPending: boolean}) {
  return (
    <div className="flex flex-col gap-1">
      <h5 className="text-muted-foreground flex items-center gap-2 text-xs">
        <div className="h-2 w-2 rounded-full bg-green-300"></div>
        Pemasukan
      </h5>
      {isPending ? (
        <Skeleton className="h-5 w-[120px] rounded-sm" />
      ) : (
        <p className="text-sm font-semibold tracking-tight">
          {!amount ? rupiah(0) : rupiah(amount)}
        </p>
      )}
    </div>
  )
}

function Expense({amount, isPending}: {amount: number; isPending: boolean}) {
  return (
    <div className="flex flex-col gap-1">
      <h5 className="text-muted-foreground flex items-center gap-2 text-xs">
        <div className="h-2 w-2 rounded-full bg-red-300"></div>
        Pengeluaran
      </h5>
      {isPending ? (
        <Skeleton className="h-5 w-[120px] rounded-sm" />
      ) : (
        <p className="text-sm font-semibold tracking-tight">
          {!amount ? rupiah(0) : rupiah(amount)}
        </p>
      )}
    </div>
  )
}

function FreeCash({amount, isPending}: {amount: number; isPending: boolean}) {
  return (
    <div className="flex flex-col gap-1">
      <h5 className="text-muted-foreground flex items-center gap-2 text-xs">
        <div className="h-2 w-2 rounded-full bg-gray-200"></div>
        Belum dialokasikan (Free Cash)
      </h5>
      {isPending ? (
        <Skeleton className="h-5 w-[120px] rounded-sm" />
      ) : (
        <p className="text-sm font-semibold tracking-tight">
          {!amount ? rupiah(0) : rupiah(amount)}
        </p>
      )}
    </div>
  )
}

export default Sum
