"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
    id: string;
    groupName: string;
    groupEngName: string;
    createdAt: string;
    // amount: number;
    // status: "pending" | "processing" | "success" | "failed";
    // email: string;
};

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "id",
        header: "번호",
    },
    {
        accessorKey: "groupName",
        header: () => <div className="">그룹명</div>,
        cell: ({ row }) => {
            return (
                <div>
                    <Link href={`/groups/${row.original.groupEngName}/member`}>{row.getValue("groupName")}</Link>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: () => <div className="text-right">생성일시</div>,
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            const formatted = new Intl.DateTimeFormat("ko-KR", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(date);

            return <div className="text-right">{formatted}</div>;
        },
    },
];
