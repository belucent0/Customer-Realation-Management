import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { Card, CardContainer, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getGroupsAPI } from "../../../apis";

export default async function GroupsPage() {
    let data: Payment[] = [];

    const result = await getGroupsAPI();

    if (result.status === "success") {
        data = result.data;
    }

    return (
        <>
            <div className="container mx-auto py-10">
                <Card>
                    <CardContainer>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-semibold">그룹 목록</h1>
                                <Link href="/groups/produce">
                                    <Button>새 그룹 생성하기</Button>
                                </Link>
                            </div>
                        </CardContent>

                        <CardContent>
                            <DataTable columns={columns} data={data} />
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#">1</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext href="#" />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </CardContent>
                    </CardContainer>
                </Card>
            </div>
        </>
    );
}
