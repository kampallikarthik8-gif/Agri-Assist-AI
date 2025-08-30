
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDataTable } from "@/components/client/user-data-table";
import { users } from "@/lib/users";

export default async function UsersPage() {

  // In a real app, you would fetch this data from your database.
  const userData = await Promise.resolve(users);

  return (
    <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">View and manage all users in the application.</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all the registered users in the Agri Assist Ai application.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UserDataTable data={userData} />
        </CardContent>
      </Card>
    </div>
  );
}
